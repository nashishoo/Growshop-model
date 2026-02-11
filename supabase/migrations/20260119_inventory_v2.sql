-- =====================================================
-- Migration: Inventory 2.0 - Add Advanced Stock Management Columns
-- Date: 2026-01-19
-- =====================================================
-- This migration adds new columns for advanced inventory management:
-- - is_featured: Mark products for featured display
-- - low_stock_threshold: Custom threshold per product
-- - hero_image_url: Dedicated column for featured product images
-- =====================================================

-- Add is_featured column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add low_stock_threshold column (default 5 units)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0);

-- Add hero_image_url column for featured products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN products.is_featured IS 'Flag to mark products for featured display on homepage or special sections';
COMMENT ON COLUMN products.low_stock_threshold IS 'Custom threshold for low stock alerts (default: 5 units)';
COMMENT ON COLUMN products.hero_image_url IS 'Dedicated hero/banner image URL for featured product displays (PNG with transparency recommended)';

-- Create index for featured products (fast homepage queries)
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON products(is_featured) 
WHERE is_featured = true;

-- Create index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_low_stock 
ON products(stock_quantity, low_stock_threshold) 
WHERE stock_quantity <= low_stock_threshold;

-- Verification query
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('is_featured', 'low_stock_threshold', 'hero_image_url')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Inventory 2.0 Migration completed successfully!';
    RAISE NOTICE 'Added columns: is_featured (BOOLEAN), low_stock_threshold (INTEGER), hero_image_url (TEXT)';
END $$;
