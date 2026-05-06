import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Store, Truck, CreditCard, Plus, Trash2, AlertCircle, CheckCircle2, Eye, EyeOff, Phone, MessageCircle, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/hooks/useSettings';
import { ContactSettings } from '@/components/admin/ContactSettings';
import { MessengerLinksSettings } from '@/components/admin/MessengerLinksSettings';
import { RequisitesSettings } from '@/components/admin/RequisitesSettings';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
}

interface DeliveryZone {
  name: string;
  price: string;
}

interface DeliverySettings {
  freeDeliveryThreshold: string;
  deliveryZones: DeliveryZone[];
  selfPickup: boolean;
  selfPickupAddress: string;
}

interface PaymentSettings {
  cardPayment: boolean;
  cashPayment: boolean;
  onlinePayment: boolean;
  yookassaShopId: string;
  yookassaSecretKey: string;
  yookassaTestMode: boolean;
}

const defaultGeneral: GeneralSettings = {
  siteName: 'Кошарик',
  siteDescription: 'Воздушные шары и оформление праздников',
  phone: '+7 (900) 123-45-67',
  email: 'info@flyart.ru',
  address: 'Красноярск',
  workingHours: 'Пн-Вс: 9:00 - 21:00',
};

const defaultDelivery: DeliverySettings = {
  freeDeliveryThreshold: '3000',
  deliveryZones: [{ name: 'По городу', price: '350' }],
  selfPickup: true,
  selfPickupAddress: 'Красноярск',
};

const defaultPayment: PaymentSettings = {
  cardPayment: true,
  cashPayment: true,
  onlinePayment: false,
  yookassaShopId: '',
  yookassaSecretKey: '',
  yookassaTestMode: true,
};

export default function Settings() {
  const [showPassword1, setShowPassword1] = useState(false);
  const { data: generalData, isLoading: generalLoading, save: saveGeneral, isSaving: savingGeneral } = 
    useSettings<GeneralSettings>('general', defaultGeneral);
  const { data: deliveryData, isLoading: deliveryLoading, save: saveDelivery, isSaving: savingDelivery } = 
    useSettings<DeliverySettings>('delivery', defaultDelivery);
  const { data: paymentData, isLoading: paymentLoading, save: savePayment, isSaving: savingPayment } = 
    useSettings<PaymentSettings>('payment', defaultPayment);

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneral);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(defaultDelivery);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPayment);

  useEffect(() => {
    if (generalData) setGeneralSettings(generalData);
  }, [generalData]);

  useEffect(() => {
    if (deliveryData) setDeliverySettings(deliveryData);
  }, [deliveryData]);

  useEffect(() => {
    if (paymentData) setPaymentSettings(paymentData);
  }, [paymentData]);

  const addDeliveryZone = () => {
    setDeliverySettings({
      ...deliverySettings,
      deliveryZones: [...deliverySettings.deliveryZones, { name: '', price: '' }],
    });
  };

  const removeDeliveryZone = (index: number) => {
    const zones = [...deliverySettings.deliveryZones];
    zones.splice(index, 1);
    setDeliverySettings({ ...deliverySettings, deliveryZones: zones });
  };

  if (generalLoading || deliveryLoading || paymentLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">Общие настройки магазина</p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Общие настройки магазина</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Phone className="h-4 w-4" />
            Контакты
          </TabsTrigger>
          <TabsTrigger value="messengers" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Связь
          </TabsTrigger>
          <TabsTrigger value="requisites" className="gap-2">
            <Building2 className="h-4 w-4" />
            Реквизиты
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2">
            <Truck className="h-4 w-4" />
            Доставка
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Оплата
          </TabsTrigger>
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

              <Button onClick={() => saveGeneral(generalSettings)} disabled={savingGeneral}>
                <Save className="h-4 w-4 mr-2" />
                {savingGeneral ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <ContactSettings />
        </TabsContent>

        <TabsContent value="messengers" className="space-y-6">
          <MessengerLinksSettings />
        </TabsContent>

        <TabsContent value="requisites" className="space-y-6">
          <RequisitesSettings />
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
                <div className="flex items-center justify-between">
                  <Label>Зоны доставки</Label>
                  <Button variant="outline" size="sm" onClick={addDeliveryZone}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
                {deliverySettings.deliveryZones.map((zone, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="md:col-span-2">
                      <Input
                        value={zone.name}
                        onChange={(e) => {
                          const zones = [...deliverySettings.deliveryZones];
                          zones[index].name = e.target.value;
                          setDeliverySettings({ ...deliverySettings, deliveryZones: zones });
                        }}
                        placeholder="Название зоны"
                      />
                    </div>
                    <div className="flex gap-2">
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeDeliveryZone(index)}
                        disabled={deliverySettings.deliveryZones.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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

              <Button onClick={() => saveDelivery(deliverySettings)} disabled={savingDelivery}>
                <Save className="h-4 w-4 mr-2" />
                {savingDelivery ? 'Сохранение...' : 'Сохранить'}
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

              <div className="flex items-center justify-between py-2 border-t pt-4">
                <div>
                  <Label>Онлайн-оплата (ЮKassa)</Label>
                  <p className="text-sm text-muted-foreground">Оплата на сайте через ЮKassa</p>
                </div>
                <Switch
                  checked={paymentSettings.onlinePayment}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, onlinePayment: checked })}
                />
              </div>

              {/* YooKassa settings - shown when online payment is enabled */}
              {paymentSettings.onlinePayment && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <Label className="text-base font-semibold">Настройки ЮKassa</Label>
                  </div>

                  {/* Status indicator */}
                  {paymentSettings.yookassaShopId && paymentSettings.yookassaSecretKey ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        ЮKassa настроена {paymentSettings.yookassaTestMode ? '(тестовый режим)' : '(боевой режим)'}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700">
                        Заполните все поля для активации онлайн-оплаты
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Shop ID (Идентификатор магазина)</Label>
                    <Input
                      value={paymentSettings.yookassaShopId}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, yookassaShopId: e.target.value })}
                      placeholder="Ваш Shop ID из личного кабинета ЮKassa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Секретный ключ</Label>
                    <div className="relative">
                      <Input
                        type={showPassword1 ? 'text' : 'password'}
                        value={paymentSettings.yookassaSecretKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, yookassaSecretKey: e.target.value })}
                        placeholder="Секретный ключ API"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword1(!showPassword1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Найдите в личном кабинете ЮKassa: Интеграция → Ключи API
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label>Тестовый режим</Label>
                      <p className="text-sm text-muted-foreground">Включить для тестирования без реальных платежей</p>
                    </div>
                    <Switch
                      checked={paymentSettings.yookassaTestMode}
                      onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, yookassaTestMode: checked })}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Ключи можно получить в <a href="https://yookassa.ru/my" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">личном кабинете ЮKassa</a>. 
                    Для тестирования используйте тестовый магазин.
                  </p>
                </div>
              )}

              <Button onClick={() => savePayment(paymentSettings)} disabled={savingPayment}>
                <Save className="h-4 w-4 mr-2" />
                {savingPayment ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
