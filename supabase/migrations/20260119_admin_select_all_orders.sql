-- =====================================================
-- Fix: Allow Admins to SELECT (view) ALL orders and order_items
-- This enables the admin dashboard to display all users' orders
-- and the "Delete All Orders" functionality to work correctly
-- =====================================================

-- Policy: Admins can SELECT (view) ANY order
CREATE POLICY "Admins can view all orders"
ON orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can SELECT (view) ANY order_items
CREATE POLICY "Admins can view all order_items"
ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can UPDATE any order (for status changes, etc.)
CREATE POLICY "Admins can update all orders"
ON orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admins can view all payment_logs
CREATE POLICY "Admins can view all payment_logs"
ON payment_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- Verify policies were created
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'payment_logs')
AND policyname LIKE '%Admins can%';
