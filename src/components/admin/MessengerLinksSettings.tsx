import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, MessageCircle, Plus, Trash2, GripVertical } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface MessengerChannel {
  type: string;
  value: string;
  label: string;
  enabled: boolean;
}

interface MessengerLinks {
  channels: MessengerChannel[];
}

const defaultMessengerLinks: MessengerLinks = {
  channels: [
    { type: 'phone', value: '+79237714004', label: 'Позвонить', enabled: true },
    { type: 'whatsapp', value: '79237714004', label: 'WhatsApp', enabled: true },
    { type: 'telegram', value: 'КошарикKRSK', label: 'Telegram', enabled: true },
    { type: 'vk', value: 'flyart_krasnoyarsk', label: 'ВКонтакте', enabled: true },
    { type: 'max', value: 'f9LHodD0cOIgsBJYhwYzvgXVZQEOZWcZYTilnvjWf02P4dHFbb4aELVqSGQ', label: 'MAX', enabled: true },
  ],
};

const channelTypes = [
  { value: 'phone', label: 'Телефон', placeholder: '+79001234567', helpText: 'Номер телефона с кодом страны' },
  { value: 'whatsapp', label: 'WhatsApp', placeholder: '79001234567', helpText: 'Номер без + и пробелов' },
  { value: 'telegram', label: 'Telegram', placeholder: 'username', helpText: 'Username без @' },
  { value: 'vk', label: 'ВКонтакте', placeholder: 'group_id', helpText: 'ID группы или пользователя' },
  { value: 'max', label: 'MAX', placeholder: 'id', helpText: 'ID пользователя MAX' },
];

export function MessengerLinksSettings() {
  const { data, isLoading, save, isSaving } = useSettings<MessengerLinks>('messenger_links', defaultMessengerLinks);
  const [formData, setFormData] = useState<MessengerLinks>(defaultMessengerLinks);

  useEffect(() => {
    if (data && data.channels) {
      setFormData(data);
    }
  }, [data]);

  const updateChannel = (index: number, updates: Partial<MessengerChannel>) => {
    const channels = [...formData.channels];
    channels[index] = { ...channels[index], ...updates };
    setFormData({ ...formData, channels });
  };

  const removeChannel = (index: number) => {
    const channels = formData.channels.filter((_, i) => i !== index);
    setFormData({ ...formData, channels });
  };

  const addChannel = () => {
    const channels = [...formData.channels, { type: 'phone', value: '', label: 'Новый канал', enabled: true }];
    setFormData({ ...formData, channels });
  };

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
            <MessageCircle className="h-5 w-5" />
            Кнопка связи (FloatingContactButton)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Настройте каналы связи, которые отображаются в плавающей кнопке на сайте.
          </p>

          <div className="space-y-4">
            {formData.channels.map((channel, index) => {
              const typeInfo = channelTypes.find(t => t.value === channel.type) || channelTypes[0];
              
              return (
                <div key={index} className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <span className="font-medium">{channel.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={(checked) => updateChannel(index, { enabled: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChannel(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Тип канала</Label>
                      <select
                        value={channel.type}
                        onChange={(e) => updateChannel(index, { type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {channelTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Название</Label>
                      <Input
                        value={channel.label}
                        onChange={(e) => updateChannel(index, { label: e.target.value })}
                        placeholder="Название кнопки"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Значение</Label>
                      <Input
                        value={channel.value}
                        onChange={(e) => updateChannel(index, { value: e.target.value })}
                        placeholder={typeInfo.placeholder}
                      />
                      <p className="text-xs text-muted-foreground">{typeInfo.helpText}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="outline" onClick={addChannel}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить канал
          </Button>

          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
