-- Add Bongs category
INSERT INTO categories (name, slug, description)
VALUES ('Bongs', 'bongs', 'Bongs, pipas de vidrio, metal, plástico y bubblers')
ON CONFLICT (slug) DO NOTHING;
