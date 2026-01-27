

# Расширенный план: Реорганизация админ-панели + Подборки + Видео + Breadcrumbs

## Обзор всех изменений

Этот план включает:
1. Реорганизацию админ-панели (7 разделов вместо 12)
2. Страницу редактирования контактов, мессенджеров и реквизитов
3. Редактирование фонового видео Hero-блока
4. Функционал "Подборки" (Collections) для праздников
5. Breadcrumbs на страницах каталога и товара

---

## Часть 1: Новая структура админ-панели

### Было: 12 пунктов меню

```text
Дашборд | Товары | Категории | Заказы | Клиенты | Отзывы | 
VK Клипы | Маркетинг | Контент | Импорт | Пользователи | Настройки
```

### Станет: 7 пунктов меню

| Раздел | Вкладки внутри |
|--------|----------------|
| **Дашборд** | - |
| **Каталог** | Товары, Категории, Импорт |
| **Заказы** | - |
| **Клиенты** | Заявки, Отзывы |
| **Контент** | Страницы, VK Клипы, Подборки, Hero-видео |
| **Маркетинг** | - |
| **Настройки** | Общие, Контакты, Связь, Реквизиты, Доставка, Оплата, Пользователи |

---

## Часть 2: Настройки - новые вкладки

### Вкладка "Контакты"

| Поле | Описание |
|------|----------|
| Телефон | Основной номер (используется везде на сайте) |
| Email | Электронная почта |
| Адрес | Физический адрес |
| Часы работы | Время работы |
| Координаты карты | Широта, долгота для Яндекс.Карт |

### Вкладка "Связь" (FloatingContactButton)

Динамическое управление кнопкой связи:
- Включать/выключать каждый канал
- Редактировать ссылку/идентификатор
- Добавлять новые мессенджеры

| Канал | Настраиваемые поля | 
|-------|-------------------|
| Телефон | Номер, иконка |
| WhatsApp | Номер без + |
| Telegram | Username или ссылка |
| VK | ID группы |
| MAX | Ссылка |

### Вкладка "Реквизиты"

| Поле | Пример |
|------|--------|
| ИП | ИП Портных Татьяна Сергеевна |
| ОГРНИП | 324246800171702 |
| ИНН | 246520751702 |
| Банк | АО "ТБанк" |
| БИК | 044525974 |
| Корр. счёт | 30101810145250000974 |
| Расчётный счёт | 40802810100003287534 |

---

## Часть 3: Редактирование Hero-видео

### Расположение в админ-панели
Раздел **Контент** -> вкладка **"Hero-видео"**

### Функционал
- Загрузка нового видео (mp4)
- Предпросмотр текущего видео
- Замена видео без перезагрузки кода

### Хранение
- Видео загружается в Supabase Storage (bucket: `hero-videos`)
- URL сохраняется в таблице `settings` (ключ: `hero_video`)

### Изменения в HeroSection.tsx
- Загрузка URL видео из настроек
- Fallback на `/videos/hero-balloons.mp4` если не настроено

---

## Часть 4: Функционал "Подборки" (Collections)

### Описание
Тематические подборки товаров для праздников (8 марта, Новый год, День рождения и т.д.), отображаемые на главной странице под Hero-блоком.

### Визуальное отображение (главная страница)
- Горизонтальная карусель с карточками подборок
- Каждая карточка: изображение + название + краткое описание
- Клик ведёт на отдельную страницу подборки

### Страница подборки `/collection/:slug`
- Hero-баннер с изображением и названием
- Описание подборки
- Сетка товаров (как в каталоге)
- Breadcrumbs: Главная > Подборки > Название

### Админ-панель: Контент -> вкладка "Подборки"
| Функция | Описание |
|---------|----------|
| Создание подборки | Название, slug, описание, изображение |
| Добавление товаров | Вручную (поиск) или из категории |
| Порядок отображения | Drag-and-drop |
| Активность | Включить/выключить подборку |
| Даты | Опционально: дата начала и окончания показа |

### Структура данных (новые таблицы)

**Таблица: `collections`**
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | PK |
| name | text | Название (8 марта, Новый год) |
| slug | text | URL-friendly slug |
| description | text | Описание подборки |
| image_url | text | URL изображения |
| is_active | boolean | Активна ли |
| sort_order | integer | Порядок на главной |
| starts_at | timestamp | Начало показа (опц.) |
| ends_at | timestamp | Конец показа (опц.) |
| created_at | timestamp | Дата создания |
| updated_at | timestamp | Дата обновления |

**Таблица: `collection_items`**
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | PK |
| collection_id | uuid | FK -> collections |
| product_id | uuid | FK -> products (если добавлен вручную) |
| category_id | uuid | FK -> categories (если из категории) |
| sort_order | integer | Порядок в подборке |

### Логика формирования товаров подборки
1. Если `product_id` указан - добавляется конкретный товар
2. Если `category_id` указан - добавляются все активные товары из категории
3. Комбинация: можно добавить и товары, и категории

---

## Часть 5: Breadcrumbs для каталога и товара

### Страница каталога `/catalog`
Без категории:
```text
Главная > Каталог
```

С выбранной категорией:
```text
Главная > Каталог > Для девочки
```

### Страница товара `/product/:slug`
Базовый вариант:
```text
Главная > Каталог > Название товара
```

С категорией товара:
```text
Главная > Каталог > Для девочки > Набор шаров "Принцесса"
```

### Реализация
- Использовать существующий компонент `Breadcrumbs.tsx`
- На странице товара: загрузить категорию из `product_categories`
- SEO-разметка Schema.org BreadcrumbList

---

## Техническая реализация

### Новые файлы

| Файл | Описание |
|------|----------|
| `src/pages/admin/CatalogHub.tsx` | Объединяет Товары + Категории + Импорт |
| `src/pages/admin/ClientsHub.tsx` | Объединяет Заявки + Отзывы |
| `src/pages/admin/ContentHub.tsx` | Объединяет Страницы + VK Клипы + Подборки + Hero-видео |
| `src/components/admin/ContactSettings.tsx` | Вкладка редактирования контактов |
| `src/components/admin/MessengerLinksSettings.tsx` | Вкладка управления кнопкой связи |
| `src/components/admin/RequisitesSettings.tsx` | Вкладка реквизитов |
| `src/components/admin/HeroVideoSettings.tsx` | Вкладка редактирования Hero-видео |
| `src/components/admin/CollectionsManager.tsx` | Управление подборками |
| `src/components/admin/CollectionEditor.tsx` | Редактор одной подборки |
| `src/pages/Collection.tsx` | Публичная страница подборки |
| `src/components/home/CollectionsSection.tsx` | Блок подборок на главной |

### Изменения в существующих файлах

| Файл | Изменения |
|------|-----------|
| `src/components/admin/AdminLayout.tsx` | Сократить меню до 7 пунктов |
| `src/App.tsx` | Новые маршруты для хабов и подборок |
| `src/pages/admin/Settings.tsx` | 4 новые вкладки (Контакты, Связь, Реквизиты, Пользователи) |
| `src/pages/Index.tsx` | Добавить CollectionsSection после HeroSection |
| `src/pages/Catalog.tsx` | Добавить Breadcrumbs |
| `src/pages/Product.tsx` | Добавить Breadcrumbs с категорией |
| `src/components/home/HeroSection.tsx` | Загружать видео из настроек |
| `src/components/FloatingContactButton.tsx` | Загружать ссылки из настроек |
| `src/hooks/useContactInfo.tsx` | Добавить мессенджеры и реквизиты |

### Новые маршруты

```text
# Публичные
/collection/:slug              → Collection (страница подборки)

# Админ-панель
/admin4547                     → Дашборд
/admin4547/catalog             → CatalogHub (Товары)
/admin4547/catalog/categories  → CatalogHub (Категории)
/admin4547/catalog/import      → CatalogHub (Импорт)
/admin4547/catalog/:id         → ProductEdit
/admin4547/orders              → Orders
/admin4547/clients             → ClientsHub (Заявки)
/admin4547/clients/reviews     → ClientsHub (Отзывы)
/admin4547/content             → ContentHub (Страницы)
/admin4547/content/vk-clips    → ContentHub (VK Клипы)
/admin4547/content/collections → ContentHub (Подборки)
/admin4547/content/hero-video  → ContentHub (Hero-видео)
/admin4547/marketing           → Marketing
/admin4547/settings            → Settings (7 вкладок)
```

### Структура данных в БД

**Новые записи в таблице `settings`:**

```json
// Ключ: contact_info
{
  "phone": "+7 (923) 771-40-04",
  "email": "tatyanaportnykh@gmail.com",
  "address": "г. Красноярск, ул. Александра Матросова 30ст57",
  "workingHours": "Ежедневно с 09:00 до 22:00",
  "mapLat": "55.974025",
  "mapLng": "92.887274"
}

// Ключ: messenger_links
{
  "channels": [
    { "type": "phone", "value": "+79237714004", "label": "Позвонить", "enabled": true },
    { "type": "whatsapp", "value": "79237714004", "label": "WhatsApp", "enabled": true },
    { "type": "telegram", "value": "FlyArtKRSK", "label": "Telegram", "enabled": true },
    { "type": "vk", "value": "flyart_krasnoyarsk", "label": "ВКонтакте", "enabled": true },
    { "type": "max", "value": "f9LHodD0...", "label": "MAX", "enabled": true }
  ]
}

// Ключ: requisites
{
  "companyName": "ИП Портных Татьяна Сергеевна",
  "ogrnip": "324246800171702",
  "inn": "246520751702",
  "bank": "АО \"ТБанк\"",
  "bik": "044525974",
  "corrAccount": "30101810145250000974",
  "account": "40802810100003287534"
}

// Ключ: hero_video
{
  "url": "https://...supabase.co/storage/v1/object/public/hero-videos/video.mp4",
  "fallback": "/videos/hero-balloons.mp4"
}
```

**Новые таблицы (миграция):**

```sql
-- Таблица подборок
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Связь подборок с товарами/категориями
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_item_type CHECK (
    (product_id IS NOT NULL AND category_id IS NULL) OR
    (product_id IS NULL AND category_id IS NOT NULL)
  )
);

-- Индексы
CREATE INDEX idx_collections_active ON collections(is_active, sort_order);
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);

-- RLS политики
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Публичный просмотр активных подборок
CREATE POLICY "Anyone can view active collections" ON collections
  FOR SELECT USING (is_active = true);

-- Админы могут управлять
CREATE POLICY "Admins can manage collections" ON collections
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Anyone can view collection items" ON collection_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage collection items" ON collection_items
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- Storage bucket для Hero-видео
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-videos', 'hero-videos', true);
```

---

## Порядок реализации

### Этап 1: База данных и хранилище
- Создать таблицы `collections` и `collection_items`
- Создать storage bucket `hero-videos`
- Добавить RLS политики

### Этап 2: Компоненты-хабы для админки
- CatalogHub.tsx
- ClientsHub.tsx
- ContentHub.tsx
- Рефакторинг существующих страниц (убрать заголовки)

### Этап 3: Настройки (новые вкладки)
- ContactSettings.tsx
- MessengerLinksSettings.tsx
- RequisitesSettings.tsx
- Интегрировать в Settings.tsx

### Этап 4: Hero-видео
- HeroVideoSettings.tsx с загрузкой видео
- Обновить HeroSection.tsx для динамической загрузки

### Этап 5: Подборки
- CollectionsManager.tsx - список подборок
- CollectionEditor.tsx - редактор с поиском товаров
- CollectionsSection.tsx - блок на главной
- Collection.tsx - публичная страница

### Этап 6: Breadcrumbs
- Обновить Catalog.tsx
- Обновить Product.tsx (с загрузкой категории)

### Этап 7: Динамические контакты
- Обновить useContactInfo.tsx
- Обновить FloatingContactButton.tsx
- Обновить страницы с реквизитами

### Этап 8: Маршруты и меню
- Обновить App.tsx
- Обновить AdminLayout.tsx

---

## Преимущества

1. **Упрощённая навигация** - 7 разделов вместо 12
2. **Централизованное управление** - контакты, мессенджеры, реквизиты в одном месте
3. **Гибкий Hero-блок** - замена видео без изменения кода
4. **Маркетинговые подборки** - быстрое создание тематических страниц для праздников
5. **Улучшенный SEO** - breadcrumbs на всех страницах каталога
6. **Масштабируемость** - легко добавлять новые вкладки и функции

