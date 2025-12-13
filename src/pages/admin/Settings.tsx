import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Store, Truck, CreditCard, Users } from 'lucide-react';

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'FlyArt',
    siteDescription: 'Воздушные шары и оформление праздников',
    phone: '+7 (495) 000-00-00',
    email: 'info@flyart.ru',
    address: 'Москва, ул. Примерная, д. 1',
    workingHours: 'Ежедневно с 9:00 до 21:00',
  });

  const [deliverySettings, setDeliverySettings] = useState({
    freeDeliveryThreshold: '3000',
    deliveryZones: [
      { name: 'Внутри МКАД', price: '350' },
      { name: 'До 10 км от МКАД', price: '600' },
      { name: 'До 20 км от МКАД', price: '950' },
    ],
    selfPickup: true,
    selfPickupAddress: 'Москва, ул. Примерная, д. 1',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    cardPayment: true,
    cashPayment: true,
    onlinePayment: false,
  });

  const handleSaveGeneral = () => {
    localStorage.setItem('general-settings', JSON.stringify(generalSettings));
    toast.success('Общие настройки сохранены');
  };

  const handleSaveDelivery = () => {
    localStorage.setItem('delivery-settings', JSON.stringify(deliverySettings));
    toast.success('Настройки доставки сохранены');
  };

  const handleSavePayment = () => {
    localStorage.setItem('payment-settings', JSON.stringify(paymentSettings));
    toast.success('Настройки оплаты сохранены');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Общие настройки магазина</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="delivery">Доставка</TabsTrigger>
          <TabsTrigger value="payment">Оплата</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Информация о магазине
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Название сайта</Label>
                  <Input
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input
                    value={generalSettings.phone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Часы работы</Label>
                  <Input
                    value={generalSettings.workingHours}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, workingHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Адрес</Label>
                <Input
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                />
              </div>

              <Button onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Настройки доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Бесплатная доставка от (₽)</Label>
                <Input
                  type="number"
                  value={deliverySettings.freeDeliveryThreshold}
                  onChange={(e) => setDeliverySettings({ ...deliverySettings, freeDeliveryThreshold: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <Label>Зоны доставки</Label>
                {deliverySettings.deliveryZones.map((zone, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={zone.name}
                      onChange={(e) => {
                        const zones = [...deliverySettings.deliveryZones];
                        zones[index].name = e.target.value;
                        setDeliverySettings({ ...deliverySettings, deliveryZones: zones });
                      }}
                      placeholder="Название зоны"
                    />
                    <Input
                      type="number"
                      value={zone.price}
                      onChange={(e) => {
                        const zones = [...deliverySettings.deliveryZones];
                        zones[index].price = e.target.value;
                        setDeliverySettings({ ...deliverySettings, deliveryZones: zones });
                      }}
                      placeholder="Цена"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Самовывоз</Label>
                  <p className="text-sm text-muted-foreground">Разрешить самовывоз</p>
                </div>
                <Switch
                  checked={deliverySettings.selfPickup}
                  onCheckedChange={(checked) => setDeliverySettings({ ...deliverySettings, selfPickup: checked })}
                />
              </div>

              {deliverySettings.selfPickup && (
                <div className="space-y-2">
                  <Label>Адрес самовывоза</Label>
                  <Input
                    value={deliverySettings.selfPickupAddress}
                    onChange={(e) => setDeliverySettings({ ...deliverySettings, selfPickupAddress: e.target.value })}
                  />
                </div>
              )}

              <Button onClick={handleSaveDelivery}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Способы оплаты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Оплата картой при получении</Label>
                  <p className="text-sm text-muted-foreground">Курьер принимает оплату картой</p>
                </div>
                <Switch
                  checked={paymentSettings.cardPayment}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, cardPayment: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Оплата наличными</Label>
                  <p className="text-sm text-muted-foreground">Оплата наличными при получении</p>
                </div>
                <Switch
                  checked={paymentSettings.cashPayment}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, cashPayment: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Онлайн-оплата</Label>
                  <p className="text-sm text-muted-foreground">Оплата на сайте через платёжную систему</p>
                </div>
                <Switch
                  checked={paymentSettings.onlinePayment}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, onlinePayment: checked })}
                />
              </div>

              <Button onClick={handleSavePayment}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
