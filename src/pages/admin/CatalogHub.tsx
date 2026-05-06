import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Package, FolderTree, Upload, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ProductsContent from './ProductsContent';
import CategoriesContent from './CategoriesContent';
import ImportContent from './ImportContent';

const tabs = [
  { value: 'products', label: 'Товары', icon: Package },
  { value: 'categories', label: 'Категории', icon: FolderTree },
  { value: 'import', label: 'Импорт', icon: Upload },
];

export default function CatalogHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'products';
  const [downloadingYml, setDownloadingYml] = useState(false);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleDownloadYml = async () => {
    setDownloadingYml(true);
    try {
      const siteUrl = window.location.origin;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/yml-feed?siteUrl=${encodeURIComponent(siteUrl)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Ошибка генерации фида');
      
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'yandex-feed.yml';
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('YML-фид скачан');
    } catch (error) {
      console.error('Error downloading YML:', error);
      toast.error('Ошибка при скачивании YML-фида');
    } finally {
      setDownloadingYml(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Каталог</h1>
          <p className="text-muted-foreground">Управление товарами и категориями</p>
        </div>
        <Button variant="outline" onClick={handleDownloadYml} disabled={downloadingYml}>
          <FileDown className="h-4 w-4 mr-2" />
          {downloadingYml ? 'Генерация...' : 'Скачать YML-фид'}
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductsContent />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <CategoriesContent />
        </TabsContent>
        <TabsContent value="import" className="mt-6">
          <ImportContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
