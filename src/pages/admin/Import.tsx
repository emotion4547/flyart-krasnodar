import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Check, X, AlertTriangle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

interface ProductRow {
  'Tilda UID'?: string;
  'External ID'?: string;
  'Brand'?: string;
  'SKU'?: string;
  'Category'?: string;
  'Title'?: string;
  'Description'?: string;
  'Text'?: string;
  'Photo'?: string;
  'Price'?: number | string;
  'Price Old'?: number | string;
  'Quantity'?: number | string;
  'Weight'?: number | string;
  'Length'?: number | string;
  'Width'?: number | string;
  'Height'?: number | string;
  'SEO title'?: string;
  'SEO descr'?: string;
  'SEO keywords'?: string;
  'FB title'?: string;
  'FB descr'?: string;
}

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        toast.error('Выберите файл Excel (.xlsx или .xls)');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const processImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ProductRow[] = XLSX.utils.sheet_to_json(worksheet);

      const created: string[] = [];
      const updated: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        setProgress(Math.round(((i + 1) / jsonData.length) * 100));

        try {
          if (!row['Title'] || !row['SKU']) {
            errors.push(`Строка ${i + 2}: отсутствует название или артикул`);
            continue;
          }

          const externalId = row['External ID'] || row['Tilda UID'] || '';
          const price = parseFloat(String(row['Price'] || 0));

          if (isNaN(price) || price <= 0) {
            errors.push(`Строка ${i + 2}: некорректная цена для "${row['Title']}"`);
            continue;
          }

          const productData = {
            title: row['Title'],
            sku: row['SKU'],
            slug: row['Title'].toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-').replace(/-+/g, '-'),
            description: row['Description'] || null,
            full_text: row['Text'] || null,
            price: price,
            price_old: row['Price Old'] ? parseFloat(String(row['Price Old'])) : null,
            quantity: row['Quantity'] ? parseInt(String(row['Quantity'])) : null,
            weight: row['Weight'] ? parseFloat(String(row['Weight'])) : null,
            length: row['Length'] ? parseFloat(String(row['Length'])) : null,
            width: row['Width'] ? parseFloat(String(row['Width'])) : null,
            height: row['Height'] ? parseFloat(String(row['Height'])) : null,
            seo_title: row['SEO title'] || null,
            seo_description: row['SEO descr'] || null,
            seo_keywords: row['SEO keywords'] || null,
            og_title: row['FB title'] || null,
            og_description: row['FB descr'] || null,
            external_id: externalId || null,
            is_active: true,
          };

          // Check if product exists by external_id
          let existingProduct = null;
          if (externalId) {
            const { data } = await supabase
              .from('products')
              .select('id')
              .eq('external_id', externalId)
              .maybeSingle();
            existingProduct = data;
          }

          // If not found by external_id, check by SKU
          if (!existingProduct) {
            const { data } = await supabase
              .from('products')
              .select('id')
              .eq('sku', row['SKU'])
              .maybeSingle();
            existingProduct = data;
          }

          let productId: string;

          if (existingProduct) {
            // Update existing product
            const { error } = await supabase
              .from('products')
              .update(productData)
              .eq('id', existingProduct.id);
            if (error) throw error;
            productId = existingProduct.id;
            updated.push(row['Title']);
          } else {
            // Create new product
            const { data, error } = await supabase
              .from('products')
              .insert(productData)
              .select('id')
              .single();
            if (error) throw error;
            productId = data.id;
            created.push(row['Title']);
          }

          // Handle image
          if (row['Photo']) {
            await supabase.from('product_images').delete().eq('product_id', productId);
            await supabase.from('product_images').insert({
              product_id: productId,
              url: row['Photo'],
              is_main: true,
            });
          }

          // Handle categories
          if (row['Category']) {
            await supabase.from('product_categories').delete().eq('product_id', productId);
            
            const categoryNames = row['Category'].split(';').map((c) => c.trim()).filter(Boolean);
            
            for (const categoryName of categoryNames) {
              // Find or create category
              let { data: category } = await supabase
                .from('categories')
                .select('id')
                .eq('name', categoryName)
                .maybeSingle();

              if (!category) {
                const { data: newCategory, error: catError } = await supabase
                  .from('categories')
                  .insert({
                    name: categoryName,
                    slug: categoryName.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '-'),
                  })
                  .select('id')
                  .single();
                if (!catError) {
                  category = newCategory;
                }
              }

              if (category) {
                await supabase.from('product_categories').insert({
                  product_id: productId,
                  category_id: category.id,
                });
              }
            }
          }
        } catch (err: any) {
          errors.push(`Строка ${i + 2}: ${err.message || 'Ошибка обработки'}`);
        }
      }

      setResult({
        created: created.length,
        updated: updated.length,
        errors,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });

      toast.success(`Импорт завершён: создано ${created.length}, обновлено ${updated.length}`);
    } catch (err: any) {
      toast.error('Ошибка импорта: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Tilda UID': '',
        'External ID': 'PROD-001',
        'Brand': 'FlyArt',
        'SKU': 'SKU-001',
        'Category': 'Шары на день рождения; Фольгированные шары',
        'Title': 'Набор шаров "День Рождения"',
        'Description': 'Красивый набор шаров для праздника',
        'Text': 'Полное описание товара...',
        'Photo': 'https://example.com/photo.jpg',
        'Price': 1500,
        'Price Old': 2000,
        'Quantity': 10,
        'Weight': 0.5,
        'Length': 30,
        'Width': 30,
        'Height': 50,
        'SEO title': 'Купить набор шаров - FlyArt',
        'SEO descr': 'Набор шаров на день рождения с доставкой',
        'SEO keywords': 'шары, день рождения, праздник',
        'FB title': 'Набор шаров День Рождения',
        'FB descr': 'Красивые шары для вашего праздника',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Товары');
    XLSX.writeFile(wb, 'import-template.xlsx');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Импорт из Excel</h1>
        <p className="text-muted-foreground">Массовая загрузка товаров из Excel-файла</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Загрузка файла
            </CardTitle>
            <CardDescription>
              Выберите Excel-файл с товарами для импорта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">Нажмите для выбора файла</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    или перетащите файл сюда
                  </p>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Обработка...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={processImport}
                disabled={!file || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Обработка...' : 'Начать импорт'}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Шаблон
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результаты импорта</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{result.created}</p>
                      <p className="text-sm text-muted-foreground">Создано</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                      <p className="text-sm text-muted-foreground">Обновлено</p>
                    </div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Ошибки ({result.errors.length})</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                      {result.errors.map((error, i) => (
                        <p key={i} className="text-muted-foreground">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Загрузите файл для просмотра результатов</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Инструкция по импорту</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>Формат файла</h4>
          <p>Файл должен быть в формате Excel (.xlsx или .xls) со следующими колонками:</p>
          <ul>
            <li><strong>Title</strong> — Название товара (обязательно)</li>
            <li><strong>SKU</strong> — Артикул (обязательно)</li>
            <li><strong>Price</strong> — Цена (обязательно)</li>
            <li><strong>External ID</strong> — Внешний ID для синхронизации</li>
            <li><strong>Category</strong> — Категории через точку с запятой</li>
            <li><strong>Description</strong> — Краткое описание</li>
            <li><strong>Text</strong> — Полное описание</li>
            <li><strong>Photo</strong> — URL изображения</li>
            <li><strong>Price Old</strong> — Старая цена</li>
            <li><strong>Quantity</strong> — Количество на складе</li>
            <li><strong>Weight, Length, Width, Height</strong> — Габариты</li>
            <li><strong>SEO title, SEO descr, SEO keywords</strong> — SEO-поля</li>
            <li><strong>FB title, FB descr</strong> — Open Graph</li>
          </ul>
          <h4>Логика обновления</h4>
          <p>
            Если товар с таким External ID или SKU уже существует, он будет обновлён.
            Иначе создаётся новый товар.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
