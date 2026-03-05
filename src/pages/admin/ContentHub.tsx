import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Play, Layers, Video, Star, Handshake } from 'lucide-react';
import PagesContent from './PagesContent';
import VKClipsContent from './VKClipsContent';
import CollectionsManager from '@/components/admin/CollectionsManager';
import HeroVideoSettings from '@/components/admin/HeroVideoSettings';
import { FeaturedCategoriesManager } from '@/components/admin/FeaturedCategoriesManager';
import PartnersManager from '@/components/admin/PartnersManager';

const tabs = [
  { value: 'pages', label: 'Страницы', icon: FileText },
  { value: 'featured', label: 'Популярные', icon: Star },
  { value: 'partners', label: 'Партнёры', icon: Handshake },
  { value: 'vk-clips', label: 'VK Клипы', icon: Play },
  { value: 'collections', label: 'Подборки', icon: Layers },
  { value: 'hero-video', label: 'Hero-видео', icon: Video },
];

export default function ContentHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pages';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Контент</h1>
        <p className="text-muted-foreground">Управление контентом сайта</p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid lg:grid-cols-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <PagesContent />
        </TabsContent>
        <TabsContent value="featured" className="mt-6">
          <FeaturedCategoriesManager />
        </TabsContent>
        <TabsContent value="partners" className="mt-6">
          <PartnersManager />
        </TabsContent>
        <TabsContent value="vk-clips" className="mt-6">
          <VKClipsContent />
        </TabsContent>
        <TabsContent value="collections" className="mt-6">
          <CollectionsManager />
        </TabsContent>
        <TabsContent value="hero-video" className="mt-6">
          <HeroVideoSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
