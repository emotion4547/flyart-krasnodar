import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Code, FileText, Globe, Target, Ticket } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import AdminWheelContent from './AdminWheelContent';
import AdminPromoCodesHub from './AdminPromoCodesHub';
interface SeoTemplates {
  productTitle: string;
  productDescription: string;
  categoryTitle: string;
  categoryDescription: string;
}

interface RobotsTxt {
  content: string;
}

interface AnalyticsCode {
  yandexMetrika: string;
  googleAnalytics: string;
  facebookPixel: string;
}

const defaultSeoTemplates: SeoTemplates = {
  productTitle: '{{title}} - Купить в FlyArt',
  productDescription: '{{title}} по цене {{price}} руб. {{description}}',
  categoryTitle: '{{name}} - Каталог FlyArt',
  categoryDescription: 'Купить {{name}} в FlyArt. {{description}}',
};

const defaultRobotsTxt: RobotsTxt = {
  content: `User-agent: *
Allow: /
Disallow: /admin4547/
Disallow: /cart
Disallow: /checkout

Sitemap: https://flyart.ru/sitemap.xml`,
};

const defaultAnalytics: AnalyticsCode = {
  yandexMetrika: '',
  googleAnalytics: '',
  facebookPixel: '',
};

export default function Marketing() {
  const { data: seoData, isLoading: seoLoading, save: saveSeo, isSaving: savingSeo } = 
    useSettings<SeoTemplates>('seo_templates', defaultSeoTemplates);
  const { data: robotsData, isLoading: robotsLoading, save: saveRobots, isSaving: savingRobots } = 
    useSettings<RobotsTxt>('robots_txt', defaultRobotsTxt);
  const { data: analyticsData, isLoading: analyticsLoading, save: saveAnalytics, isSaving: savingAnalytics } = 
    useSettings<AnalyticsCode>('analytics', defaultAnalytics);

  const [seoTemplates, setSeoTemplates] = useState<SeoTemplates>(defaultSeoTemplates);
  const [robotsTxt, setRobotsTxt] = useState<string>(defaultRobotsTxt.content);
  const [analyticsCode, setAnalyticsCode] = useState<AnalyticsCode>(defaultAnalytics);

  useEffect(() => {
    if (seoData) setSeoTemplates(seoData);
  }, [seoData]);

  useEffect(() => {
    if (robotsData) setRobotsTxt(robotsData.content);
  }, [robotsData]);

  useEffect(() => {
    if (analyticsData) setAnalyticsCode(analyticsData);
  }, [analyticsData]);

  if (seoLoading || robotsLoading || analyticsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Маркетинг / SEO</h1>
          <p className="text-muted-foreground">Глобальные настройки SEO и интеграции</p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Маркетинг / SEO</h1>
        <p className="text-muted-foreground">Глобальные настройки SEO и интеграции</p>
      </div>

      <Tabs defaultValue="wheel" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="wheel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Колесо
          </TabsTrigger>
          <TabsTrigger value="promos" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Промокоды
          </TabsTrigger>
          <TabsTrigger value="templates">SEO</TabsTrigger>
          <TabsTrigger value="robots">robots.txt</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="wheel">
          <AdminWheelContent />
        </TabsContent>

        <TabsContent value="promos">
          <AdminPromoCodesHub />
        </TabsContent>

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

              <Button onClick={() => saveSeo(seoTemplates)} disabled={savingSeo}>
                <Save className="h-4 w-4 mr-2" />
                {savingSeo ? 'Сохранение...' : 'Сохранить шаблоны'}
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
              <Button onClick={() => saveRobots({ content: robotsTxt })} disabled={savingRobots}>
                <Save className="h-4 w-4 mr-2" />
                {savingRobots ? 'Сохранение...' : 'Сохранить robots.txt'}
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

              <Button onClick={() => saveAnalytics(analyticsCode)} disabled={savingAnalytics}>
                <Save className="h-4 w-4 mr-2" />
                {savingAnalytics ? 'Сохранение...' : 'Сохранить коды аналитики'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
