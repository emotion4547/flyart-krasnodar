
-- Drop old constraint and add new one with payment statuses
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('new', 'pending_payment', 'paid', 'processing', 'delivering', 'delivered', 'cancelled', 'payment_failed'));
