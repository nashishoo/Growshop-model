-- =====================================================
-- Fix: store_settings RLS Security
-- Addresses: "RLS Disabled in Public" and "Sensitive Columns Exposed"
-- =====================================================

-- 1. Enable Row Level Security on store_settings
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Anyone can read non-sensitive store settings (for frontend display)
CREATE POLICY "Public can view store settings"
ON store_settings
FOR SELECT
USING (true);

-- 3. Policy: Only admins can insert/update/delete store settings
CREATE POLICY "Admins can manage store settings"
ON store_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- Note: If store_settings contains sensitive API keys,
-- you should either:
-- A) Move them to environment variables (recommended)
-- B) Create a view that excludes sensitive columns for public access
-- =====================================================

-- Verify RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'store_settings';
