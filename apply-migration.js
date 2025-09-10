const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables from .env.local
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
const envVars = {}

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🚀 Applying dynamic translations migration...')

  try {
    // Create the dynamic_translations table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Create the active_translations view
        CREATE OR REPLACE VIEW public.active_translations AS
        SELECT
          language_code,
          namespace,
          key_path,
          translation_value,
          updated_at
        FROM morpheus.dynamic_translations
        WHERE is_active = true
        ORDER BY language_code, namespace, key_path;
      `
    })

    if (createTableError) {
      console.error('❌ Error creating table:', createTableError)
      return
    }

    console.log('✅ Dynamic translations table created successfully!')
    console.log('🎉 Migration applied successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()