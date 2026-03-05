

# План оптимизации производительности

Реализуем 11 пунктов из плана (всё кроме статичного изображения в Hero).

---

## 1. Локальные шрифты вместо Google Fonts

**Проблема:** `@import url('fonts.googleapis.com/...')` в `index.css` — блокирующий запрос (300-800мс).

**Решение:**
- Удалить `@import` из `index.css`
- Удалить `preconnect` к `fonts.googleapis.com` и `fonts.gstatic.com` из `index.html`
- Добавить `@font-face` с `font-display: swap` в `index.css`, ссылающийся на CDN шрифтов (fontsource или cdnfonts) через `url()` с woff2 форматом
- Примечание: так как мы не можем размещать файлы шрифтов напрямую в проект, используем CDN-ссылки на woff2 файлы без блокирующего `@import`

## 2. Убрать preload видео из index.html

Удалить строку `<link rel="preload" href="/videos/hero-balloons.mp4" as="video">` — она блокирует критические ресурсы.

## 3. Сжатие изображений при загрузке (Canvas API)

Создать `src/lib/imageCompression.ts`:
- Функция `compressImage(file, maxWidth=1200, quality=0.8)` → возвращает `File` в WebP
- Ресайз через Canvas, конвертация `canvas.toBlob('image/webp')`
- Интегрировать в `ImageUploader.tsx` и `MultiImageUploader.tsx` — сжимать перед upload

## 4. Lazy loading для изображений

Добавить `loading="lazy"` и `decoding="async"` к `<img>` в `CollectionsSection`, `CategoriesSection`, `ProductCard`.

## 5. Отложить FloatingContactButton, FortuneWheelTrigger, PendingSpinHandler

В `App.tsx`: обернуть эти компоненты в отложенную загрузку через `lazy` + `Suspense` или `useEffect` с таймером 3 секунды.

## 6. fetchpriority="high" для LCP

В `HeroSection.tsx`: добавить `fetchpriority="high"` на видео-элемент.

## 7. content-visibility: auto

В `LazySection.tsx`: добавить CSS `content-visibility: auto` и `contain-intrinsic-size` для ускорения первого рендера.

## 8. dns-prefetch для внешних доменов

В `index.html`: добавить `<link rel="dns-prefetch">` для VK, Telegram и других внешних ресурсов.

## 9. Удалить неиспользуемую анимацию balloonFloat

Анимация `animate-balloon-float` / `@keyframes balloonFloat` в `index.css` — проверить использование, удалить если не используется.

## 10. Оптимизация логотипа

Убедиться что логотип в хедере имеет фиксированные `width`/`height` для предотвращения CLS.

## 11. Обновить документацию

Создать `docs/updates-2026-03-05.md` с описанием всех оптимизаций.

---

## Файлы для изменения

| Файл | Изменение |
|---|---|
| `src/index.css` | Заменить @import на @font-face, удалить balloonFloat |
| `index.html` | Убрать preload видео, убрать preconnect fonts, добавить dns-prefetch |
| `src/lib/imageCompression.ts` | Новый — Canvas API сжатие |
| `src/components/admin/ImageUploader.tsx` | Интеграция сжатия |
| `src/components/admin/MultiImageUploader.tsx` | Интеграция сжатия |
| `src/App.tsx` | Отложить FloatingContactButton и др. |
| `src/components/home/HeroSection.tsx` | fetchpriority="high" |
| `src/components/LazySection.tsx` | content-visibility: auto |
| `src/components/home/CollectionsSection.tsx` | loading="lazy" на img |
| `src/components/home/CategoriesSection.tsx` | loading="lazy" на img |
| `src/components/home/ProductCard.tsx` | loading="lazy" на img |
| `docs/updates-2026-03-05.md` | Новый — changelog |

