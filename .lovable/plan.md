# FlyArt Project — Changelog

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
| Контент | Страницы, VK Клипы, Подборки, Hero-видео |
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

---

### UI/UX улучшения

- **Breadcrumbs** на страницах каталога и товара
- **Динамические контакты** из таблицы `settings`
- **FloatingContactButton** с настраиваемыми каналами связи
- **Автовыбор обложек категорий** из товаров с алгоритмом разнообразия

---

## Файлы изменены сегодня

- `src/pages/Checkout.tsx` — валидация email, Telegram-уведомления, rollback
- `src/pages/Product.tsx` — исправлена ошибка загрузки категории
- `supabase/functions/yookassa-init/index.ts` — инициализация платежа
- `supabase/functions/yookassa-callback/index.ts` — webhook + Telegram (YooKassa ID, статус)
- `supabase/functions/send-telegram/index.ts` — универсальная функция уведомлений
