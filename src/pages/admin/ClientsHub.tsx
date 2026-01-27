import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquareText } from 'lucide-react';
import ClientsContent from './ClientsContent';
import ReviewsContent from './ReviewsContent';

const tabs = [
  { value: 'requests', label: 'Заявки', icon: Phone },
  { value: 'reviews', label: 'Отзывы', icon: MessageSquareText },
];

export default function ClientsHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'requests';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Клиенты</h1>
        <p className="text-muted-foreground">Заявки и отзывы клиентов</p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <ClientsContent />
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <ReviewsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
