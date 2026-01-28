# FlyArt Project — Changelog

## Обновления 28 января 2026

### Производительность на мобильных устройствах

- **VKClipsSection оптимизирован:**
  - Заменена JS-анимация (requestAnimationFrame) на CSS-анимацию с GPU-ускорением
  - Ленивая загрузка iframe — видео загружаются только при наведении/касании
  - Уменьшено количество дублей клипов (3x → 2x) — вдвое меньше iframe
  - Убраны постоянные ре-рендеры React

- **Переключатель отключения секции VK Клипов:**
  - Настройка в Content → VK Клипы
  - Ключ в `settings`: `vk_clips_section` → `{ enabled: boolean }`
  - Полностью отключает загрузку iframe для максимальной производительности

---

### Управление популярными разделами (Featured Categories)

- **Таблица:** `featured_categories`
  - `category_id` — связь с категорией
  - `custom_title` — кастомное название
  - `custom_image_url` — загруженная обложка
  - `sort_order` — порядок отображения

- **Компонент:** `FeaturedCategoriesManager.tsx`
  - Ручной выбор категорий для главной страницы
  - Загрузка кастомных обложек через ImageUploader
  - Сортировка кнопками вверх/вниз

- **Автоматический fallback изображений:**
  - Приоритет: `custom_image_url` → `category.image_url` → случайное фото товара
  - Рандомный выбор из товаров категории (не первое фото)

---

### UI/UX улучшения

- **CollectionsSection ("На повестке дня"):**
  - Мобильная версия: карточки вертикально друг под другом
  - Десктоп: горизонтальная карусель

- **FeaturedCategoriesManager:**
  - Уменьшен размер диалога для мобильных устройств
  - Добавлена прокрутка при переполнении (max-h-[90vh])

---

## Файлы изменены сегодня

- `src/components/home/VKClipsSection.tsx` — CSS-анимация, ленивая загрузка, проверка настроек
- `src/components/home/CollectionsSection.tsx` — вертикальная раскладка на мобильных
- `src/components/home/CategoriesSection.tsx` — fallback на случайное фото товара
- `src/components/admin/FeaturedCategoriesManager.tsx` — управление популярными разделами
- `src/pages/admin/VKClipsContent.tsx` — переключатель отключения секции
- `src/pages/admin/ContentHub.tsx` — вкладка "Популярные"

---

## Обновления 27 января 2026

### Интеграция YooKassa (онлайн-оплата)

- **Edge Functions:**
  - `yookassa-init` — инициализация платежа, создание ссылки на оплату
  - `yookassa-callback` — обработка webhook-уведомлений от YooKassa

- **Настройки платежей** в таблице `settings` (key: `payment`):
  - `yookassaShopId` — Shop ID (1251407)
  - `yookassaSecretKey` — секретный ключ
  - `onlinePayment: true` — включение онлайн-оплаты
  - `cardPayment: true` — оплата картой при получении
  - `cashPayment: true` — оплата наличными

- **Статусы заказов** (constraint `orders_status_check`):
  - `new`, `pending_payment`, `paid`, `processing`, `delivering`, `delivered`, `cancelled`, `payment_failed`

- **Валидация email:** обязателен при онлайн-оплате (требование 54-ФЗ для чеков)

- **Rollback механизм:** если YooKassa не инициализирует платёж, заказ автоматически удаляется

---

### Telegram-уведомления

- **Edge Function:** `send-telegram` — отправка сообщений через Telegram Bot API

- **Секреты:**
  - `TELEGRAM_BOT_TOKEN` — токен бота
  - `TELEGRAM_CHAT_ID` — ID чата для уведомлений

- **Уведомления отправляются:**
  - 🛒 **Новый заказ** (оффлайн-оплата) — сразу при создании заказа
  - 💳 **Оплата получена** (онлайн-оплата) — только после подтверждения оплаты от YooKassa (`succeeded`)

- **Информация в уведомлении об оплате:**
  - Номер заказа
  - YooKassa Payment ID
  - Статус платежа
  - Сумма
  - Данные клиента

---

### RLS-политики для анонимного checkout

- `orders` — INSERT для `anon`, SELECT для `anon` и `authenticated`
- `order_items` — INSERT для `anon`, SELECT для `anon` и `authenticated`

---

### Реорганизация админ-панели (12 → 7 разделов)

| Раздел | Вкладки |
|--------|---------|
| Дашборд | — |
| Каталог | Товары, Категории, Импорт |
| Заказы | — |
| Клиенты | Заявки, Отзывы |
| Контент | Страницы, VK Клипы, Подборки, Hero-видео, Популярные |
| Маркетинг | — |
| Настройки | Общие, Контакты, Связь, Реквизиты |

---

### Функционал подборок (Collections)

- **Таблицы:** `collections`, `collection_items`
- **Компоненты:**
  - `CollectionsManager.tsx` — управление подборками
  - `CollectionEditor.tsx` — редактор с загрузкой изображений
  - `CollectionsSection.tsx` — блок "На повестке дня" на главной
  - `Collection.tsx` — публичная страница подборки `/collection/:slug`

---

### Настройки в админ-панели

| Ключ в `settings` | Описание |
|-------------------|----------|
| `contact_info` | Телефон, email, адрес, часы работы, координаты |
| `messenger_links` | Каналы связи (WhatsApp, Telegram, VK, MAX) |
| `requisites` | Юридические реквизиты (ИП, ИНН, банк) |
| `hero_video` | URL фонового видео |
| `payment` | Настройки способов оплаты и YooKassa |
| `vk_clips_section` | Включение/выключение секции VK Клипов |

---

### UI/UX улучшения

- **Breadcrumbs** на страницах каталога и товара
- **Динамические контакты** из таблицы `settings`
- **FloatingContactButton** с настраиваемыми каналами связи
- **Автовыбор обложек категорий** из товаров с алгоритмом разнообразия
