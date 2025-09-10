-- Create dynamic translations table
CREATE TABLE IF NOT EXISTS public.dynamic_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL, -- 'en', 'fr', etc.
    namespace VARCHAR(100) NOT NULL, -- 'common', 'admin', 'homepage', etc.
    key_path TEXT NOT NULL, -- 'nav.home', 'common.loading', etc.
    translation_value TEXT NOT NULL, -- The actual translation text
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),

    -- Ensure unique combination of language, namespace, and key_path
    UNIQUE(language_code, namespace, key_path)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_language_code ON public.dynamic_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_namespace ON public.dynamic_translations(namespace);
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_key_path ON public.dynamic_translations(key_path);
CREATE INDEX IF NOT EXISTS idx_dynamic_translations_active ON public.dynamic_translations(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_dynamic_translations_updated_at
    BEFORE UPDATE ON public.dynamic_translations
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE public.dynamic_translations ENABLE ROW LEVEL SECURITY;

-- Create policies for dynamic translations
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to dynamic translations" ON public.dynamic_translations
    FOR SELECT USING (true);

-- Allow insert/update/delete only to admin users
CREATE POLICY "Allow admin write access to dynamic translations" ON public.dynamic_translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create a view for easier querying of active translations by language
CREATE OR REPLACE VIEW public.active_translations AS
SELECT
    language_code,
    namespace,
    key_path,
    translation_value,
    updated_at
FROM public.dynamic_translations
WHERE is_active = true
ORDER BY language_code, namespace, key_path;

-- Grant necessary permissions
GRANT SELECT ON public.active_translations TO authenticated;
GRANT ALL ON public.dynamic_translations TO authenticated;