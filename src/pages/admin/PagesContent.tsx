import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, FileText } from 'lucide-react';
import { usePageSeo } from '@/hooks/useSettings';

const pages = [
  { id: 'delivery', name: 'Доставка и оплата', path: '/delivery' },
  { id: 'guarantee', name: 'Гарантия', path: '/guarantee' },
  { id: 'contacts', name: 'Контакты', path: '/contacts' },
  { id: 'privacy', name: 'Политика конфиденциальности', path: '/privacy' },
  { id: 'offer', name: 'Публичная оферта', path: '/offer' },
];

interface PageSeoForm {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  og_title: string;
  og_description: string;
}

function PageSeoEditor({ pageId }: { pageId: string }) {
  const { data, isLoading, save, isSaving } = usePageSeo(pageId);
  const [form, setForm] = useState<PageSeoForm>({
    title: '',
    description: '',
    keywords: '',
    h1: '',
    og_title: '',
    og_description: '',
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        description: data.description || '',
        keywords: data.keywords || '',
        h1: data.h1 || '',
        og_title: data.og_title || '',
        og_description: data.og_description || '',
      });
    }
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="seo">
        <TabsList>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="og">Open Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>H1 заголовок</Label>
            <Input
              value={form.h1}
              onChange={(e) => setForm({ ...form, h1: e.target.value })}
              placeholder="Заголовок страницы"
            />
          </div>

          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{form.title.length}/60 символов</p>
          </div>

          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{form.description.length}/160 символов</p>
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <Input
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="ключевые, слова, через, запятую"
            />
          </div>
        </TabsContent>

        <TabsContent value="og" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>OG Title</Label>
            <Input
              value={form.og_title}
              onChange={(e) => setForm({ ...form, og_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>OG Description</Label>
            <Textarea
              value={form.og_description}
              onChange={(e) => setForm({ ...form, og_description: e.target.value })}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={() => save(form)} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  );
}

export default function PagesContent() {
  const [selectedPage, setSelectedPage] = useState(pages[0].id);

  return (
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
        <CardContent>
          <PageSeoEditor key={selectedPage} pageId={selectedPage} />
        </CardContent>
      </Card>
    </div>
  );
}
