-- Добавляем поле для способа оплаты
ALTER TABLE public.orders 
ADD COLUMN payment_method TEXT DEFAULT 'card';

-- Добавляем комментарий для понимания значений
COMMENT ON COLUMN public.orders.payment_method IS 'Способ оплаты: card (картой при получении), cash (наличными), online (онлайн-оплата)';