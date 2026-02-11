-- Add tracking_number column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);

-- Create index for quick tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number) WHERE tracking_number IS NOT NULL;
