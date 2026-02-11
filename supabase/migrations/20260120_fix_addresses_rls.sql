-- =====================================================
-- Fix: Addresses RLS Policies for Delete/Update
-- Issue: Users cannot delete/update their own addresses
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Create specific policies for each operation
CREATE POLICY "Users can select own addresses" ON addresses 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON addresses 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON addresses 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON addresses 
    FOR DELETE USING (auth.uid() = user_id);

-- Admin override policy
DROP POLICY IF EXISTS "Admins can manage addresses" ON addresses;
CREATE POLICY "Admins can manage addresses" ON addresses 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
