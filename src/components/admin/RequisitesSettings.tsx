import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Building2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface Requisites {
  companyName: string;
  ogrnip: string;
  inn: string;
  bank: string;
  bik: string;
  corrAccount: string;
  account: string;
}

const defaultRequisites: Requisites = {
  companyName: 'ИП Портных Татьяна Сергеевна',
  ogrnip: '324246800171702',
  inn: '246520751702',
  bank: 'АО "ТБанк"',
  bik: '044525974',
  corrAccount: '30101810145250000974',
  account: '40802810100003287534',
};

export function RequisitesSettings() {
  const { data, isLoading, save, isSaving } = useSettings<Requisites>('requisites', defaultRequisites);
  const [formData, setFormData] = useState<Requisites>(defaultRequisites);

  useEffect(() => {
    if (data) {
      setFormData({ ...defaultRequisites, ...data });
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
            <Building2 className="h-5 w-5" />
            Реквизиты компании
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Реквизиты отображаются на странице оферты и используются для документов.
          </p>

          <div className="space-y-2">
            <Label>Наименование ИП / ООО</Label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="ИП Иванов Иван Иванович"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ОГРНИП / ОГРН</Label>
              <Input
                value={formData.ogrnip}
                onChange={(e) => setFormData({ ...formData, ogrnip: e.target.value })}
                placeholder="324246800171702"
              />
            </div>
            <div className="space-y-2">
              <Label>ИНН</Label>
              <Input
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                placeholder="246520751702"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Наименование банка</Label>
              <Input
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                placeholder='АО "ТБанк"'
              />
            </div>
            <div className="space-y-2">
              <Label>БИК</Label>
              <Input
                value={formData.bik}
                onChange={(e) => setFormData({ ...formData, bik: e.target.value })}
                placeholder="044525974"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Корреспондентский счёт</Label>
              <Input
                value={formData.corrAccount}
                onChange={(e) => setFormData({ ...formData, corrAccount: e.target.value })}
                placeholder="30101810145250000974"
              />
            </div>
            <div className="space-y-2">
              <Label>Расчётный счёт</Label>
              <Input
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                placeholder="40802810100003287534"
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
