

# План: Система «Партнёры»

## Общая идея

Партнёры — компании/сервисы, которые предоставляют скидки/бонусы покупателям FlyArt после оформления заказа. Управление через админку, отображение на отдельной странице `/partners`, в блоке на главной и в виде мини-карточек в корзине.

---

## 1. База данных — таблица `partners`

Новая таблица:
```sql
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  description text,
  benefit_short text NOT NULL,    -- краткое описание выгоды ("Скидка 10% на торты")
  benefit_detail text,            -- подробное описание
  website_url text,
  promo_code text,                -- промокод партнёра (показывается после покупки)
  discount_value text,            -- "10%", "500₽" и т.д.
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Публичный просмотр активных
CREATE POLICY "Anyone can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

-- Админы управляют
CREATE POLICY "Admins can manage partners" ON public.partners
  FOR ALL USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));
```

## 2. Публичная страница `/partners`

Новый файл `src/pages/Partners.tsx`:
- Header + Footer
- SEO-компонент
- Сетка карточек партнёров (логотип, название, описание выгоды, ссылка на сайт)
- Стиль аналогичен существующим страницам (rounded-2xl карточки, gold-line)

## 3. Блок партнёров на главной

Новый компонент `src/components/home/PartnersSection.tsx`:
- Горизонтальная карусель логотипов с кратким описанием выгоды
- Кнопка «Все партнёры» → `/partners`
- Добавляется в `Index.tsx` как LazySection

## 4. Мини-карточки в корзине

В `src/pages/Cart.tsx` добавить блок **«Бонусы от партнёров»** между списком товаров и итого:
- Компактные горизонтальные карточки (логотип + benefit_short)
- Текст: «Оформите заказ и получите бонусы от наших партнёров»
- Компонент `src/components/cart/PartnerBenefits.tsx`

## 5. Админка — управление партнёрами

Новый компонент `src/components/admin/PartnersManager.tsx`:
- CRUD: создание, редактирование, удаление, переключение активности
- Загрузка логотипа через ImageUploader
- Drag-and-drop сортировка (как в CollectionsManager)
- Добавить вкладку «Партнёры» в `ContentHub.tsx`

## 6. Роутинг

В `App.tsx`:
- Добавить lazy-импорт `Partners` и маршрут `/partners`

## 7. Навигация

В Footer добавить ссылку «Партнёры» → `/partners`

---

## Файлы

| Файл | Действие |
|---|---|
| Migration SQL | Создать таблицу `partners` |
| `src/pages/Partners.tsx` | Новый — публичная страница |
| `src/components/home/PartnersSection.tsx` | Новый — блок на главной |
| `src/components/cart/PartnerBenefits.tsx` | Новый — карточки в корзине |
| `src/components/admin/PartnersManager.tsx` | Новый — CRUD в админке |
| `src/pages/admin/ContentHub.tsx` | Добавить вкладку «Партнёры» |
| `src/pages/Index.tsx` | Добавить PartnersSection |
| `src/pages/Cart.tsx` | Добавить PartnerBenefits |
| `src/App.tsx` | Маршрут `/partners` |
| `src/components/layout/Footer.tsx` | Ссылка на партнёров |

