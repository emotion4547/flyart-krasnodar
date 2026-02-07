import { useState } from 'react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useUserAddresses } from '@/hooks/useUserAddresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, MapPin, Trash2, Star, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddressFormData {
  title: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  entrance: string;
  floor: string;
  intercom: string;
}

const emptyForm: AddressFormData = {
  title: 'Дом',
  city: '',
  street: '',
  house: '',
  apartment: '',
  entrance: '',
  floor: '',
  intercom: '',
};

const AccountAddresses = () => {
  const { addresses, isLoading, createAddress, updateAddress, deleteAddress, setDefaultAddress } = useUserAddresses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (address: typeof addresses[0]) => {
    setEditingId(address.id);
    setForm({
      title: address.title,
      city: address.city,
      street: address.street,
      house: address.house,
      apartment: address.apartment || '',
      entrance: address.entrance || '',
      floor: address.floor || '',
      intercom: address.intercom || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.city || !form.street || !form.house) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await createAddress(form);
      }
      setIsDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить этот адрес?')) {
      await deleteAddress(id);
    }
  };

  return (
    <AccountLayout title="Адреса доставки">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-tiffany" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={cn(
                  'bg-card rounded-2xl p-4 border transition-colors',
                  address.is_default ? 'border-tiffany' : 'border-border/50'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-tiffany flex-shrink-0" />
                    <span className="font-medium text-foreground">{address.title}</span>
                    {address.is_default && (
                      <Star className="h-4 w-4 text-gold fill-gold" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  г. {address.city}, ул. {address.street}, д. {address.house}
                  {address.apartment && `, кв. ${address.apartment}`}
                </p>

                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    Сделать основным
                  </Button>
                )}
              </div>
            ))}

            {/* Add new address card */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={handleOpenCreate}
                  className="bg-card rounded-2xl p-4 border border-dashed border-border hover:border-tiffany hover:bg-tiffany-light/20 transition-colors flex items-center justify-center gap-2 min-h-[120px] text-muted-foreground hover:text-tiffany"
                >
                  <Plus className="h-5 w-5" />
                  <span>Добавить адрес</span>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? 'Редактировать адрес' : 'Новый адрес'}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      placeholder="Дом, Работа..."
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Город *</Label>
                    <Input
                      id="city"
                      placeholder="Краснодар"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Улица *</Label>
                      <Input
                        id="street"
                        placeholder="Красная"
                        value={form.street}
                        onChange={(e) => setForm({ ...form, street: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house">Дом *</Label>
                      <Input
                        id="house"
                        placeholder="1"
                        value={form.house}
                        onChange={(e) => setForm({ ...form, house: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Квартира</Label>
                      <Input
                        id="apartment"
                        placeholder="10"
                        value={form.apartment}
                        onChange={(e) => setForm({ ...form, apartment: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entrance">Подъезд</Label>
                      <Input
                        id="entrance"
                        placeholder="1"
                        value={form.entrance}
                        onChange={(e) => setForm({ ...form, entrance: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor">Этаж</Label>
                      <Input
                        id="floor"
                        placeholder="5"
                        value={form.floor}
                        onChange={(e) => setForm({ ...form, floor: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intercom">Домофон</Label>
                      <Input
                        id="intercom"
                        placeholder="10"
                        value={form.intercom}
                        onChange={(e) => setForm({ ...form, intercom: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button 
                      type="submit" 
                      variant="cta" 
                      className="flex-1"
                      disabled={isSaving}
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Сохранить
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}
    </AccountLayout>
  );
};

export default AccountAddresses;
