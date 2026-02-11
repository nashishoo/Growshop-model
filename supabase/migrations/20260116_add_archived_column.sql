-- Add archived column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_archived ON orders(archived);

-- Update RLS policy to exclude archived orders for regular views
-- (Admins can still see them with a filter toggle)
