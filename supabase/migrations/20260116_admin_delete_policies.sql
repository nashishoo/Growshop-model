-- RLS Policies for Admin DELETE Operations
-- This allows admins to delete orders and order_items directly from the frontend
-- WITHOUT needing Edge Functions or --no-verify-jwt

-- Policy: Admins can delete ANY order
CREATE POLICY "Admins can delete all orders"
ON orders
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can delete ANY order_items
CREATE POLICY "Admins can delete all order_items"
ON order_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can delete payment logs
CREATE POLICY "Admins can delete all payment_logs"
ON payment_logs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    qual
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'payment_logs')
AND policyname LIKE '%Admins can delete%';
