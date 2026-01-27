import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  mapLat: string;
  mapLng: string;
}

const defaultContactInfo: ContactInfo = {
  phone: '+7 (923) 771-40-04',
  email: 'tatyanaportnykh@gmail.com',
  address: 'г. Красноярск, ул. Александра Матросова 30ст57',
  workingHours: 'Ежедневно с 09:00 до 22:00',
  mapLat: '55.974025',
  mapLng: '92.887274',
};

export function ContactSettings() {
  const { data, isLoading, save, isSaving } = useSettings<ContactInfo>('contact_info', defaultContactInfo);
  const [formData, setFormData] = useState<ContactInfo>(defaultContactInfo);

  useEffect(() => {
    if (data) {
      setFormData({ ...defaultContactInfo, ...data });
    }
  }, [data]);

  const handleSave = () => {
    save(formData);
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Контактная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Телефон
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (900) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Адрес
            </Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="г. Красноярск, ул. Примерная 1"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Часы работы
            </Label>
            <Input
              value={formData.workingHours}
              onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
              placeholder="Пн-Вс: 9:00 - 21:00"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Широта (для карты)</Label>
              <Input
                value={formData.mapLat}
                onChange={(e) => setFormData({ ...formData, mapLat: e.target.value })}
                placeholder="55.974025"
              />
            </div>
            <div className="space-y-2">
              <Label>Долгота (для карты)</Label>
              <Input
                value={formData.mapLng}
                onChange={(e) => setFormData({ ...formData, mapLng: e.target.value })}
                placeholder="92.887274"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
