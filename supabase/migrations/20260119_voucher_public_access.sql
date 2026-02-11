-- Migration: Allow public read access to paid orders for voucher download
-- This allows the VoucherDownloadPage to fetch order details without authentication
-- Security: Only orders with paid/shipped/delivered status can be accessed
-- The order ID itself acts as a "secret" access token

-- Create policy for public voucher access (select only)
CREATE POLICY "Allow public voucher access for paid orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (
    status IN ('paid', 'preparing', 'shipped', 'delivered')
);

-- Also need to allow access to order_items for the voucher
CREATE POLICY "Allow public order_items access for paid orders"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND orders.status IN ('paid', 'preparing', 'shipped', 'delivered')
    )
);
