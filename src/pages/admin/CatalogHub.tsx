import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FolderTree, Upload } from 'lucide-react';
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

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Каталог</h1>
        <p className="text-muted-foreground">Управление товарами и категориями</p>
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
