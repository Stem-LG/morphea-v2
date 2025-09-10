-- Dynamic Translations Migration
-- Run this SQL in your Supabase SQL Editor
-- Table will be created in the morpheus schema

-- Create the dynamic_translations table in morpheus schema
CREATE TABLE IF NOT EXISTS morpheus.dynamic_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key_path TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID,
  updated_by UUID,
  UNIQUE(language_code, namespace, key_path)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_language_code ON morpheus.dynamic_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_namespace ON morpheus.dynamic_translations(namespace);
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_active ON morpheus.dynamic_translations(is_active);

-- Enable Row Level Security
ALTER TABLE morpheus.dynamic_translations ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed for your auth setup)
CREATE POLICY "Allow authenticated users to manage translations" ON morpheus.dynamic_translations
  FOR ALL USING (auth.role() = 'authenticated');

-- Create the active_translations view in morpheus schema
CREATE OR REPLACE VIEW morpheus.active_translations AS
SELECT
  language_code,
  namespace,
  key_path,
  translation_value,
  updated_at
FROM morpheus.dynamic_translations
WHERE is_active = true
ORDER BY language_code, namespace, key_path;