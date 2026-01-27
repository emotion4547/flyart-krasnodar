

# Создание файла changelog-2026-01-27.md

## Цель
Создать документ с описанием всех изменений, внесённых в проект за 27 января 2026 года.

## Расположение файла
`docs/changelog-2026-01-27.md`

## Содержимое файла

```markdown
# Changelog — 27 января 2026

## Обзор

Масштабное обновление админ-панели и добавление функционала подборок товаров для праздников.

---

## Frontend изменения

### 1. Реорганизация админ-панели (12 → 7 разделов)

**Было:** Дашборд, Товары, Категории, Заказы, Клиенты, Отзывы, VK Клипы, Маркетинг, Контент, Импорт, Пользователи, Настройки

**Стало:**
| Раздел | Вкладки |
|--------|---------|
| Дашборд | — |
| Каталог | Товары, Категории, Импорт |
| Заказы | — |
| Клиенты | Заявки, Отзывы |
| Контент | Страницы, VK Клипы, Подборки, Hero-видео |
| Маркетинг | — |
| Настройки | Общие, Контакты, Связь, Реквизиты |

### 2. Новые компоненты

#### Хабы (объединяющие страницы):
- `src/pages/admin/CatalogHub.tsx` — товары, категории, импорт
- `src/pages/admin/ClientsHub.tsx` — заявки, отзывы
- `src/pages/admin/ContentHub.tsx` — страницы, VK клипы, подборки, hero-видео

#### Контент-компоненты (вкладки внутри хабов):
- `src/pages/admin/ProductsContent.tsx`
- `src/pages/admin/CategoriesContent.tsx`
- `src/pages/admin/ImportContent.tsx`
- `src/pages/admin/ClientsContent.tsx`
- `src/pages/admin/ReviewsContent.tsx`
- `src/pages/admin/PagesContent.tsx`
- `src/pages/admin/VKClipsContent.tsx`

#### Настройки:
- `src/components/admin/ContactSettings.tsx` — редактирование контактов
- `src/components/admin/MessengerLinksSettings.tsx` — управление FloatingContactButton
- `src/components/admin/RequisitesSettings.tsx` — юридические реквизиты
- `src/components/admin/HeroVideoSettings.tsx` — загрузка фонового видео

#### Подборки:
- `src/components/admin/CollectionsManager.tsx` — список подборок
- `src/components/admin/CollectionEditor.tsx` — редактор подборки с загрузкой изображений
- `src/components/home/CollectionsSection.tsx` — блок на главной странице
- `src/pages/Collection.tsx` — публичная страница подборки

### 3. Изменённые компоненты

- `src/components/admin/AdminLayout.tsx` — новое меню из 7 пунктов
- `src/App.tsx` — новые маршруты для хабов и подборок
- `src/pages/admin/Settings.tsx` — 4 новые вкладки
- `src/components/home/HeroSection.tsx` — динамическая загрузка видео
- `src/components/FloatingContactButton.tsx` — данные из настроек БД
- `src/pages/Catalog.tsx` — добавлены breadcrumbs
- `src/pages/Product.tsx` — breadcrumbs с категорией товара

### 4. UI/UX улучшения главной страницы

- **Блок "Подборки":**
  - Заголовок переименован в "На повестке дня"
  - Удалена надпись "Актуальное"
  - Добавлена золотая декоративная линия
  - Заголовок отцентрирован
  - Высота карточек уменьшена до `h-24`
  - Отступы оптимизированы (`py-8 md:py-12`)

- **Блок "Популярные разделы":**
  - Добавлен алгоритм автоматического выбора обложек из товаров категории
  - Функция `varietyBonus` для разнообразия изображений между категориями

---

## База данных (Supabase)

### Новые таблицы

#### `collections`
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | PK |
| name | text | Название подборки |
| slug | text | URL-slug |
| description | text | Описание |
| image_url | text | URL обложки |
| is_active | boolean | Активность |
| sort_order | integer | Порядок сортировки |
| starts_at | timestamptz | Начало показа |
| ends_at | timestamptz | Конец показа |
| created_at | timestamptz | Дата создания |
| updated_at | timestamptz | Дата обновления |

#### `collection_items`
| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | PK |
| collection_id | uuid | FK → collections |
| product_id | uuid | FK → products (опц.) |
| category_id | uuid | FK → categories (опц.) |
| sort_order | integer | Порядок в подборке |
| created_at | timestamptz | Дата создания |

### RLS-политики

```sql
-- collections
CREATE POLICY "Anyone can view active collections" ON collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage collections" ON collections
  FOR ALL USING (is_admin_or_manager(auth.uid()));

-- collection_items
CREATE POLICY "Anyone can view collection items" ON collection_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage collection items" ON collection_items
  FOR ALL USING (is_admin_or_manager(auth.uid()));
```

### Storage buckets

| Bucket | Описание | Доступ |
|--------|----------|--------|
| `hero-videos` | Фоновые видео Hero-блока | Публичный |
| `collection-images` | Обложки подборок | Публичный |

### Новые записи в таблице `settings`

| Ключ | Описание |
|------|----------|
| `contact_info` | Телефон, email, адрес, часы работы, координаты |
| `messenger_links` | Настройки каналов связи (WhatsApp, Telegram, VK, MAX) |
| `requisites` | Юридические реквизиты (ИП, ИНН, банк, счета) |
| `hero_video` | URL фонового видео |

---

## Новые маршруты

### Публичные
- `/collection/:slug` — страница подборки

### Админ-панель
- `/admin4547/catalog` — CatalogHub (вкладка Товары)
- `/admin4547/catalog/categories` — CatalogHub (вкладка Категории)
- `/admin4547/catalog/import` — CatalogHub (вкладка Импорт)
- `/admin4547/clients` — ClientsHub (вкладка Заявки)
- `/admin4547/clients/reviews` — ClientsHub (вкладка Отзывы)
- `/admin4547/content` — ContentHub (вкладка Страницы)
- `/admin4547/content/vk-clips` — ContentHub (вкладка VK Клипы)
- `/admin4547/content/collections` — ContentHub (вкладка Подборки)
- `/admin4547/content/hero-video` — ContentHub (вкладка Hero-видео)

---

## Итог

- **Упрощённая навигация:** 7 разделов вместо 12
- **Централизованное управление:** контакты, мессенджеры, реквизиты в одном месте
- **Гибкий контент:** замена Hero-видео и создание подборок без изменения кода
- **Улучшенный UX:** breadcrumbs, автоматические обложки категорий
- **Масштабируемость:** легко добавлять новые вкладки и функции
```

## Действие

Создать файл `docs/changelog-2026-01-27.md` с содержимым выше.

