-- Migration: Add 'preparing' status to orders table
-- Run this in Supabase SQL Editor

-- Drop existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with 'preparing' status
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'paid', 'preparing', 'processing', 'shipped', 'delivered', 'cancelled')
);

-- Optional: Update any 'processing' orders to 'preparing' if desired
-- UPDATE orders SET status = 'preparing' WHERE status = 'processing';
