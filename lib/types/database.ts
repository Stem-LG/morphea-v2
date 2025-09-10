export interface Database {
  public: {
    Tables: {
      dynamic_translations: {
        Row: {
          id: string
          language_code: string
          namespace: string
          key_path: string
          translation_value: string
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          language_code: string
          namespace: string
          key_path: string
          translation_value: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          language_code?: string
          namespace?: string
          key_path?: string
          translation_value?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
      }
      // Add other existing tables here as needed
      profiles: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      active_translations: {
        Row: {
          language_code: string
          namespace: string
          key_path: string
          translation_value: string
          updated_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}