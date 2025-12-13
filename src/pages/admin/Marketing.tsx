import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Code, FileText, Globe } from 'lucide-react';

export default function Marketing() {
  const [seoTemplates, setSeoTemplates] = useState({
    productTitle: '{{title}} - Купить в FlyArt',
    productDescription: '{{title}} по цене {{price}} руб. {{description}}',
    categoryTitle: '{{name}} - Каталог FlyArt',
    categoryDescription: 'Купить {{name}} в FlyArt. {{description}}',
  });

  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cart
Disallow: /checkout

Sitemap: https://flyart.ru/sitemap.xml`);

  const [analyticsCode, setAnalyticsCode] = useState({
    yandexMetrika: '',
    googleAnalytics: '',
    facebookPixel: '',
  });

  const handleSaveTemplates = () => {
    // Save to localStorage or backend
    localStorage.setItem('seo-templates', JSON.stringify(seoTemplates));
    toast.success('Шаблоны SEO сохранены');
  };

  const handleSaveRobots = () => {
    localStorage.setItem('robots-txt', robotsTxt);
    toast.success('robots.txt сохранён');
  };

  const handleSaveAnalytics = () => {
    localStorage.setItem('analytics-code', JSON.stringify(analyticsCode));
    toast.success('Коды аналитики сохранены');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Маркетинг / SEO</h1>
        <p className="text-muted-foreground">Глобальные настройки SEO и интеграции</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Шаблоны SEO</TabsTrigger>
          <TabsTrigger value="robots">robots.txt</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Шаблоны мета-тегов
              </CardTitle>
              <CardDescription>
                Используйте переменные: {'{{title}}'}, {'{{name}}'}, {'{{price}}'}, {'{{description}}'}, {'{{category}}'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Товары</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Шаблон Title</Label>
                    <Input
                      value={seoTemplates.productTitle}
                      onChange={(e) => setSeoTemplates({ ...seoTemplates, productTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Шаблон Description</Label>
                    <Textarea
                      value={seoTemplates.productDescription}
                      onChange={(e) => setSeoTemplates({ ...seoTemplates, productDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Категории</h4>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Шаблон Title</Label>
                    <Input
                      value={seoTemplates.categoryTitle}
                      onChange={(e) => setSeoTemplates({ ...seoTemplates, categoryTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Шаблон Description</Label>
                    <Textarea
                      value={seoTemplates.categoryDescription}
                      onChange={(e) => setSeoTemplates({ ...seoTemplates, categoryDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveTemplates}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить шаблоны
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                robots.txt
              </CardTitle>
              <CardDescription>
                Управление индексацией сайта поисковыми роботами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <Button onClick={handleSaveRobots}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить robots.txt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Коды аналитики
              </CardTitle>
              <CardDescription>
                Вставьте коды счётчиков аналитики
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Яндекс.Метрика (ID счётчика)</Label>
                <Input
                  value={analyticsCode.yandexMetrika}
                  onChange={(e) => setAnalyticsCode({ ...analyticsCode, yandexMetrika: e.target.value })}
                  placeholder="12345678"
                />
              </div>

              <div className="space-y-2">
                <Label>Google Analytics 4 (ID измерения)</Label>
                <Input
                  value={analyticsCode.googleAnalytics}
                  onChange={(e) => setAnalyticsCode({ ...analyticsCode, googleAnalytics: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>Facebook Pixel (ID пикселя)</Label>
                <Input
                  value={analyticsCode.facebookPixel}
                  onChange={(e) => setAnalyticsCode({ ...analyticsCode, facebookPixel: e.target.value })}
                  placeholder="1234567890123456"
                />
              </div>

              <Button onClick={handleSaveAnalytics}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить коды аналитики
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
