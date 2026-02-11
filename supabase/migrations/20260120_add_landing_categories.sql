-- Migration: Add missing categories for landing page sections
-- Run this in Supabase SQL Editor

-- =====================================================
-- ZONA CULTIVO Categories
-- =====================================================

-- Indoor (for lighting, ventilation, grow equipment)
INSERT INTO categories (name, slug, description)
VALUES ('Indoor', 'indoor', 'Equipamiento para cultivo indoor: iluminación, ventilación, carpas')
ON CONFLICT (slug) DO NOTHING;

-- Nutrientes (fertilizers, nutrients)
INSERT INTO categories (name, slug, description)
VALUES ('Nutrientes', 'nutrientes', 'Fertilizantes, nutrientes y suplementos para plantas')
ON CONFLICT (slug) DO NOTHING;

-- Note: Sustratos already exists

-- =====================================================
-- ZONA HERRAMIENTAS Categories
-- =====================================================

-- Parafernalia (grinders, papers, accessories)
INSERT INTO categories (name, slug, description)
VALUES ('Parafernalia', 'parafernalia', 'Accesorios, moledor, papeles, filtros y más')
ON CONFLICT (slug) DO NOTHING;

-- Vaporizadores
INSERT INTO categories (name, slug, description)
VALUES ('Vaporizadores', 'vaporizadores', 'Vaporizadores portátiles y de escritorio')
ON CONFLICT (slug) DO NOTHING;

-- Merch420 (merchandise, clothing, stickers)
INSERT INTO categories (name, slug, description)
VALUES ('Merch420', 'merch420', 'Merchandising, ropa, stickers y coleccionables 420')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ZONA SEMILLAS Sub-Categories
-- =====================================================

-- Semillas Automáticas
INSERT INTO categories (name, slug, description)
VALUES ('Semillas Automáticas', 'semillas-automaticas', 'Semillas autoflorecientes de ciclo corto')
ON CONFLICT (slug) DO NOTHING;

-- Semillas Feminizadas
INSERT INTO categories (name, slug, description)
VALUES ('Semillas Feminizadas', 'semillas-feminizadas', 'Semillas feminizadas fotoperiódicas')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- Verify new categories
-- =====================================================
SELECT id, name, slug FROM categories ORDER BY name;
