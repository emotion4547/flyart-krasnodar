import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, FileText } from 'lucide-react';

const pages = [
  { id: 'delivery', name: 'Доставка и оплата', path: '/delivery' },
  { id: 'guarantee', name: 'Гарантия', path: '/guarantee' },
  { id: 'contacts', name: 'Контакты', path: '/contacts' },
  { id: 'privacy', name: 'Политика конфиденциальности', path: '/privacy' },
  { id: 'offer', name: 'Публичная оферта', path: '/offer' },
];

interface PageSeo {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  ogTitle: string;
  ogDescription: string;
}

export default function Content() {
  const [selectedPage, setSelectedPage] = useState(pages[0].id);
  const [pageSeo, setPageSeo] = useState<Record<string, PageSeo>>(() => {
    const saved = localStorage.getItem('pages-seo');
    return saved ? JSON.parse(saved) : {};
  });

  const currentSeo = pageSeo[selectedPage] || {
    title: '',
    description: '',
    keywords: '',
    h1: '',
    ogTitle: '',
    ogDescription: '',
  };

  const updateSeo = (field: keyof PageSeo, value: string) => {
    setPageSeo({
      ...pageSeo,
      [selectedPage]: {
        ...currentSeo,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    localStorage.setItem('pages-seo', JSON.stringify(pageSeo));
    toast.success('Настройки страницы сохранены');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Контент</h1>
        <p className="text-muted-foreground">Управление статическими страницами сайта</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Страницы</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1 p-2">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedPage === page.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{page.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{page.path}</p>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {pages.find((p) => p.id === selectedPage)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="seo">
              <TabsList>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="og">Open Graph</TabsTrigger>
              </TabsList>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>H1 заголовок</Label>
                  <Input
                    value={currentSeo.h1}
                    onChange={(e) => updateSeo('h1', e.target.value)}
                    placeholder="Заголовок страницы"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={currentSeo.title}
                    onChange={(e) => updateSeo('title', e.target.value)}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">{currentSeo.title.length}/60 символов</p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={currentSeo.description}
                    onChange={(e) => updateSeo('description', e.target.value)}
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{currentSeo.description.length}/160 символов</p>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    value={currentSeo.keywords}
                    onChange={(e) => updateSeo('keywords', e.target.value)}
                    placeholder="ключевые, слова, через, запятую"
                  />
                </div>
              </TabsContent>

              <TabsContent value="og" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>OG Title</Label>
                  <Input
                    value={currentSeo.ogTitle}
                    onChange={(e) => updateSeo('ogTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>OG Description</Label>
                  <Textarea
                    value={currentSeo.ogDescription}
                    onChange={(e) => updateSeo('ogDescription', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
