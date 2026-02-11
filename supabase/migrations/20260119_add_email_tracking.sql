-- Migration: Add email tracking fields to orders table
-- Run this in Supabase SQL Editor

-- Add column to track when shipping notification email was sent
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add column to track when delivery notification email was sent  
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add column to track when confirmation email was sent
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP WITH TIME ZONE;
