import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  city: string;
  street: string;
  house: string;
  apartment: string | null;
  entrance: string | null;
  floor: string | null;
  intercom: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateAddressData {
  title: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  is_default?: boolean;
}

interface UseUserAddressesResult {
  addresses: UserAddress[];
  defaultAddress: UserAddress | null;
  isLoading: boolean;
  createAddress: (data: CreateAddressData) => Promise<UserAddress | null>;
  updateAddress: (id: string, data: Partial<CreateAddressData>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserAddresses(): UseUserAddressesResult {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses((data || []) as UserAddress[]);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const defaultAddress = addresses.find(a => a.is_default) || null;

  const createAddress = useCallback(async (data: CreateAddressData): Promise<UserAddress | null> => {
    if (!user) return null;

    try {
      // Если это первый адрес или is_default = true, сбрасываем остальные
      if (data.is_default || addresses.length === 0) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data: newAddress, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          ...data,
          is_default: data.is_default || addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Адрес добавлен');
      fetchAddresses();
      return newAddress as UserAddress;
    } catch (err) {
      console.error('Error creating address:', err);
      toast.error('Ошибка при добавлении адреса');
      return null;
    }
  }, [user, addresses.length, fetchAddresses]);

  const updateAddress = useCallback(async (id: string, data: Partial<CreateAddressData>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast.success('Адрес обновлён');
      fetchAddresses();
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error('Ошибка при обновлении адреса');
    }
  }, [fetchAddresses]);

  const deleteAddress = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Адрес удалён');
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Ошибка при удалении адреса');
    }
  }, [fetchAddresses]);

  const setDefaultAddress = useCallback(async (id: string): Promise<void> => {
    if (!user) return;

    try {
      // Сбрасываем все
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Устанавливаем новый
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Адрес по умолчанию изменён');
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error('Ошибка при изменении адреса');
    }
  }, [user, fetchAddresses]);

  return {
    addresses,
    defaultAddress,
    isLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
