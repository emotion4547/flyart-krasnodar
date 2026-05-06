import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  whatsapp: string;
  telegram: string;
  vk: string;
  max: string;
}

const defaultContactInfo: ContactInfo = {
  phone: '+7 (923) 771-40-04',
  email: 'tatyanaportnykh@gmail.com',
  address: 'г. Красноярск, ул. Александра Матросова 30ст57',
  workingHours: 'Ежедневно с 09:00 до 22:00',
  whatsapp: '79237714004',
  telegram: 'КошарикKRSK',
  vk: 'flyart_krasnoyarsk',
  max: 'f9LHodD0cOIgsBJYhwYzvgXVZQEOZWcZYTilnvjWf02P4dHFbb4aELVqSGQ',
};

export function useContactInfo() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'contact_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'contact_info')
        .maybeSingle();
      
      if (error) throw error;
      if (data?.value && typeof data.value === 'object') {
        return { ...defaultContactInfo, ...(data.value as object) } as ContactInfo;
      }
      return defaultContactInfo;
    },
  });

  return {
    contactInfo: data ?? defaultContactInfo,
    isLoading,
  };
}

// Export formatted phone for display
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  
  return phone;
}

// Get raw phone number for tel: links
export function getRawPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+${digits}`;
}
