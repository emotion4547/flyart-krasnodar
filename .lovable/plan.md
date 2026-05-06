
# Ребрендинг: FlyArt → Кошарик

## Цветовая палитра

На основе логотипа "Кошарик" (яркий кот с разноцветными шарами) предлагаю **3 варианта** цветовой схемы:

### Вариант A: "Яркий карнавал" (максимально близко к логотипу)
- **Primary**: Оранжевый (#F5A623) — цвет кота, главный акцент
- **CTA**: Малиновый/розовый (#E84393) — шарик из логотипа
- **Accent**: Голубой (#3498DB) — буква "о" в логотипе
- **Background**: Теплый белый (#FFFBF5)
- **Text**: Темно-серый (#2D3436)

### Вариант B: "Мягкий и дружелюбный"
- **Primary**: Приглушенный оранжевый (#E8975A)
- **CTA**: Коралловый (#FF6B6B)
- **Accent**: Мятный (#00B894)
- **Background**: Кремовый (#FFF9F0)
- **Text**: Графитовый (#2D3436)

### Вариант C: "Детский праздник"
- **Primary**: Ярко-желтый (#FDCB6E)
- **CTA**: Красный (#E74C3C)
- **Accent**: Зеленый (#6AB04C)
- **Background**: Чистый белый (#FFFFFF)
- **Text**: Темно-синий (#2C3E50)

## Что будет заменено

### 1. Логотип и визуал
- Замена `src/assets/logo-muha.png` на загруженный логотип Кошарик
- Обновление PWA-иконки (`pwa-icon.png`)
- Обновление OG-image для соцсетей

### 2. Название бренда (~40 файлов)
Замена "FlyArt" / "ni" на "Кошарик" во всех местах:
- `index.html` — title, meta-теги, OG-теги
- `vite.config.ts` — PWA manifest
- `src/components/SEO.tsx` — дефолтные мета
- `src/components/layout/Header.tsx` — название в шапке
- `src/components/home/AboutSection.tsx` — секция "О нас"
- `src/components/PWAInstallBanner.tsx`
- `src/components/ProductSchema.tsx` — Schema.org brand
- Все Schema-файлы (WebsiteSchema, OrganizationSchema, LocalBusinessSchema, AggregateRatingSchema)
- Страницы: Privacy, Offer, Guarantee, Reviews, Partners, Sitemap, DesignSystem
- Edge functions: yml-feed, sitemap
- Админка: Settings defaults, AdminLogin placeholder

### 3. Цветовая палитра
- `src/index.css` — CSS-переменные `:root` (primary, cta, accent и т.д.)
- `tailwind.config.ts` — если нужны новые токены
- Обновление `--tiffany` → новый primary цвет
- Обновление `--cta` → новый CTA цвет

### 4. Контактные данные
- Telegram: `FlyArtKRSK` → новый handle
- VK: `flyart_krasnoyarsk` → новый handle
- Email: `info@flyart.ru` → новый email
- URL: `flyart24.ru` → новый домен (если есть)

## Технические детали

- Логотип будет скопирован из загрузки в `src/assets/logo-kosharik.png`
- Все замены текста через поиск-замену по файлам
- CSS-переменные обновятся в одном файле (`src/index.css`)
- Edge functions будут переразвернуты с новым названием
