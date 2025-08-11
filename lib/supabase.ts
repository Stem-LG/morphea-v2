export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
    auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown | null
          not_after: string | null
          refreshed_at: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      jwt: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  morpheus: {
    Tables: {
      xcategprod: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xcategprodcode: string
          xcategprodid: number
          xcategprodinfobulle: string
          xcategprodintitule: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcategprodcode: string
          xcategprodid?: number
          xcategprodinfobulle: string
          xcategprodintitule: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcategprodcode?: string
          xcategprodid?: number
          xcategprodinfobulle?: string
          xcategprodintitule?: string
        }
        Relationships: []
      }
      xcouleur: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xcouleurcode: string
          xcouleurhexa: string
          xcouleurid: number
          xcouleurintitule: string
          xcouleurrvb: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcouleurcode: string
          xcouleurhexa: string
          xcouleurid?: number
          xcouleurintitule: string
          xcouleurrvb: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcouleurcode?: string
          xcouleurhexa?: string
          xcouleurid?: number
          xcouleurintitule?: string
          xcouleurrvb?: string
        }
        Relationships: []
      }
      xdevise: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xdeviseboolautorisepaiement: string
          xdevisecodealpha: string
          xdevisecodenum: string
          xdeviseid: number
          xdeviseintitule: string
          xdevisenbrdec: number
          xispivot: boolean
          xtauxechange: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xdeviseboolautorisepaiement: string
          xdevisecodealpha: string
          xdevisecodenum: string
          xdeviseid?: number
          xdeviseintitule: string
          xdevisenbrdec: number
          xispivot?: boolean
          xtauxechange?: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xdeviseboolautorisepaiement?: string
          xdevisecodealpha?: string
          xdevisecodenum?: string
          xdeviseid?: number
          xdeviseintitule?: string
          xdevisenbrdec?: number
          xispivot?: boolean
          xtauxechange?: number
        }
        Relationships: []
      }
      xtaille: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xtaillecode: string
          xtailleeur: string | null
          xtailleid: number
          xtailleintitule: string
          xtailleus: string | null
          xtaillex: string | null
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xtaillecode: string
          xtailleeur?: string | null
          xtailleid?: number
          xtailleintitule: string
          xtailleus?: string | null
          xtaillex?: string | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xtaillecode?: string
          xtailleeur?: string | null
          xtailleid?: number
          xtailleintitule?: string
          xtailleus?: string | null
          xtaillex?: string | null
        }
        Relationships: []
      }
      yboutique: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yboutiqueadressemall: string
          yboutiquecode: string
          yboutiqueid: number
          yboutiqueintitule: string | null
          ymallidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueadressemall: string
          yboutiquecode: string
          yboutiqueid?: number
          yboutiqueintitule?: string | null
          ymallidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueadressemall?: string
          yboutiquecode?: string
          yboutiqueid?: number
          yboutiqueintitule?: string | null
          ymallidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "yboutique_ymallidfk_fkey"
            columns: ["ymallidfk"]
            isOneToOne: false
            referencedRelation: "ymall"
            referencedColumns: ["ymallid"]
          },
        ]
      }
      ycompte: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ycomptecreationdate: string
          ycompteid: number
          ycompteno: string
          ycomptestatut: string
          yuseridfk: string
          yvisiteuridfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ycomptecreationdate: string
          ycompteid?: number
          ycompteno: string
          ycomptestatut: string
          yuseridfk: string
          yvisiteuridfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ycomptecreationdate?: string
          ycompteid?: number
          ycompteno?: string
          ycomptestatut?: string
          yuseridfk?: string
          yvisiteuridfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "ycompte_yvisiteuridfk_fkey"
            columns: ["yvisiteuridfk"]
            isOneToOne: false
            referencedRelation: "yvisiteur"
            referencedColumns: ["yvisiteurid"]
          },
        ]
      }
      ydesign: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ydesignactivitedate: string | null
          ydesigncode: string
          ydesigncontactemail: string
          ydesigncontactpersonne: string
          ydesigncontacttelephone: string
          ydesigncouleur1codehexa: string | null
          ydesigncouleur1codervb: string | null
          ydesigncouleur1dsg: string | null
          ydesigncouleur2codehexa: string | null
          ydesigncouleur2codervb: string | null
          ydesigncouleur2dsg: string | null
          ydesigncouleur3codehexa: string | null
          ydesigncouleur3codervb: string | null
          ydesigncouleur3dsg: string | null
          ydesignid: number
          ydesignmarque: string
          ydesignmorpheusdate: string
          ydesignnom: string
          ydesignpays: string
          ydesignspecialite: string
          yuseridfk: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydesignactivitedate?: string | null
          ydesigncode: string
          ydesigncontactemail: string
          ydesigncontactpersonne: string
          ydesigncontacttelephone: string
          ydesigncouleur1codehexa?: string | null
          ydesigncouleur1codervb?: string | null
          ydesigncouleur1dsg?: string | null
          ydesigncouleur2codehexa?: string | null
          ydesigncouleur2codervb?: string | null
          ydesigncouleur2dsg?: string | null
          ydesigncouleur3codehexa?: string | null
          ydesigncouleur3codervb?: string | null
          ydesigncouleur3dsg?: string | null
          ydesignid?: number
          ydesignmarque: string
          ydesignmorpheusdate: string
          ydesignnom: string
          ydesignpays: string
          ydesignspecialite: string
          yuseridfk: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydesignactivitedate?: string | null
          ydesigncode?: string
          ydesigncontactemail?: string
          ydesigncontactpersonne?: string
          ydesigncontacttelephone?: string
          ydesigncouleur1codehexa?: string | null
          ydesigncouleur1codervb?: string | null
          ydesigncouleur1dsg?: string | null
          ydesigncouleur2codehexa?: string | null
          ydesigncouleur2codervb?: string | null
          ydesigncouleur2dsg?: string | null
          ydesigncouleur3codehexa?: string | null
          ydesigncouleur3codervb?: string | null
          ydesigncouleur3dsg?: string | null
          ydesignid?: number
          ydesignmarque?: string
          ydesignmorpheusdate?: string
          ydesignnom?: string
          ydesignpays?: string
          ydesignspecialite?: string
          yuseridfk?: string
        }
        Relationships: []
      }
      ydetailsevent: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yboutiqueidfk: number | null
          ydesignidfk: number | null
          ydetailseventid: number
          yeventidfk: number
          ymallidfk: number
          yprodidfk: number | null
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueidfk?: number | null
          ydesignidfk?: number | null
          ydetailseventid?: number
          yeventidfk: number
          ymallidfk: number
          yprodidfk?: number | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueidfk?: number | null
          ydesignidfk?: number | null
          ydetailseventid?: number
          yeventidfk?: number
          ymallidfk?: number
          yprodidfk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ydetailsevent_yboutiqueidfk_fkey"
            columns: ["yboutiqueidfk"]
            isOneToOne: false
            referencedRelation: "yboutique"
            referencedColumns: ["yboutiqueid"]
          },
          {
            foreignKeyName: "ydetailsevent_ydesignidfk_fkey"
            columns: ["ydesignidfk"]
            isOneToOne: false
            referencedRelation: "ydesign"
            referencedColumns: ["ydesignid"]
          },
          {
            foreignKeyName: "ydetailsevent_yeventidfk_fkey"
            columns: ["yeventidfk"]
            isOneToOne: false
            referencedRelation: "yevent"
            referencedColumns: ["yeventid"]
          },
          {
            foreignKeyName: "ydetailsevent_ymallidfk_fkey"
            columns: ["ymallidfk"]
            isOneToOne: false
            referencedRelation: "ymall"
            referencedColumns: ["ymallid"]
          },
          {
            foreignKeyName: "ydetailsevent_yprodidfk_fkey"
            columns: ["yprodidfk"]
            isOneToOne: false
            referencedRelation: "yprod"
            referencedColumns: ["yprodid"]
          },
        ]
      }
      yevent: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yeventcode: string
          yeventdatedeb: string
          yeventdatefin: string
          yeventid: number
          yeventintitule: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventcode: string
          yeventdatedeb: string
          yeventdatefin: string
          yeventid?: number
          yeventintitule: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventcode?: string
          yeventdatedeb?: string
          yeventdatefin?: string
          yeventid?: number
          yeventintitule?: string
        }
        Relationships: []
      }
      yeventmedia: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yeventidfk: number | null
          yeventmediaid: number
          ymediaidfk: number | null
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventidfk?: number | null
          yeventmediaid?: number
          ymediaidfk?: number | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventidfk?: number | null
          yeventmediaid?: number
          ymediaidfk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "yeventmedia_yEventIdFk_fkey"
            columns: ["yeventidfk"]
            isOneToOne: false
            referencedRelation: "yevent"
            referencedColumns: ["yeventid"]
          },
          {
            foreignKeyName: "yeventmedia_yMediaIdFk_fkey"
            columns: ["ymediaidfk"]
            isOneToOne: false
            referencedRelation: "ymedia"
            referencedColumns: ["ymediaid"]
          },
        ]
      }
      yinfospotactions: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yinfospotactionscustomhandler: string
          yinfospotactionsdescription: string
          yinfospotactionsid: number
          yinfospotactionsmodaltype: string
          yinfospotactionstitle: string
          yinfospotactionstype: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yinfospotactionscustomhandler: string
          yinfospotactionsdescription: string
          yinfospotactionsid: number
          yinfospotactionsmodaltype: string
          yinfospotactionstitle: string
          yinfospotactionstype: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yinfospotactionscustomhandler?: string
          yinfospotactionsdescription?: string
          yinfospotactionsid?: number
          yinfospotactionsmodaltype?: string
          yinfospotactionstitle?: string
          yinfospotactionstype?: string
        }
        Relationships: []
      }
      yinfospots: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yinfospotactionidfk: number
          yinfospotsaxexyaw: string
          yinfospotsaxeypitch: string
          yinfospotsid: number
          yinfospotstext: string
          yinfospotstitle: string
          yscenesidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yinfospotactionidfk: number
          yinfospotsaxexyaw: string
          yinfospotsaxeypitch: string
          yinfospotsid: number
          yinfospotstext: string
          yinfospotstitle: string
          yscenesidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yinfospotactionidfk?: number
          yinfospotsaxexyaw?: string
          yinfospotsaxeypitch?: string
          yinfospotsid?: number
          yinfospotstext?: string
          yinfospotstitle?: string
          yscenesidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "yinfospots_yinfospotactionidfk_fkey"
            columns: ["yinfospotactionidfk"]
            isOneToOne: false
            referencedRelation: "yinfospotactions"
            referencedColumns: ["yinfospotactionsid"]
          },
          {
            foreignKeyName: "yinfospots_yscenesidfk_fkey"
            columns: ["yscenesidfk"]
            isOneToOne: false
            referencedRelation: "yscenes"
            referencedColumns: ["yscenesid"]
          },
        ]
      }
      ymall: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ymalladresse: string
          ymallcode: string
          ymallcontactemail: string
          ymallcontactpersonne: string
          ymallcontacttelephone: string
          ymallid: number
          ymallintitule: string
          ymalllocalisation: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymalladresse: string
          ymallcode: string
          ymallcontactemail: string
          ymallcontactpersonne: string
          ymallcontacttelephone: string
          ymallid?: number
          ymallintitule: string
          ymalllocalisation: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymalladresse?: string
          ymallcode?: string
          ymallcontactemail?: string
          ymallcontactpersonne?: string
          ymallcontacttelephone?: string
          ymallid?: number
          ymallintitule?: string
          ymalllocalisation?: string
        }
        Relationships: []
      }
      ymannequin: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ymannequinboolpersonne: string
          ymannequinboolsupport: string
          ymannequincode: string
          ymannequinid: number
          ymannequinnom: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymannequinboolpersonne: string
          ymannequinboolsupport: string
          ymannequincode: string
          ymannequinid: number
          ymannequinnom: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymannequinboolpersonne?: string
          ymannequinboolsupport?: string
          ymannequincode?: string
          ymannequinid?: number
          ymannequinnom?: string
        }
        Relationships: []
      }
      ymannequinprod: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yeventidfk: number
          ymannequinidfk: number
          ymannequinproddate: string
          ymannequinprodid: number
          yprodidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventidfk: number
          ymannequinidfk: number
          ymannequinproddate: string
          ymannequinprodid: number
          yprodidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventidfk?: number
          ymannequinidfk?: number
          ymannequinproddate?: string
          ymannequinprodid?: number
          yprodidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "ymannequinprod_yeventidfk_fkey"
            columns: ["yeventidfk"]
            isOneToOne: false
            referencedRelation: "yevent"
            referencedColumns: ["yeventid"]
          },
          {
            foreignKeyName: "ymannequinprod_ymannequinidfk_fkey"
            columns: ["ymannequinidfk"]
            isOneToOne: false
            referencedRelation: "ymannequin"
            referencedColumns: ["ymannequinid"]
          },
          {
            foreignKeyName: "ymannequinprod_yprodidfk_fkey"
            columns: ["yprodidfk"]
            isOneToOne: false
            referencedRelation: "yprod"
            referencedColumns: ["yprodid"]
          },
        ]
      }
      ymedia: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ymediaboolphotoeditoriale: boolean | null
          ymediaboolphotoevent: string
          ymediaboolphotoprod: string
          ymediaboolvideo: boolean
          ymediaboolvideocapsule: string
          ymediacode: string
          ymediaid: number
          ymediaintitule: string
          ymediaurl: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymediaboolphotoeditoriale?: boolean | null
          ymediaboolphotoevent?: string
          ymediaboolphotoprod?: string
          ymediaboolvideo?: boolean
          ymediaboolvideocapsule?: string
          ymediacode: string
          ymediaid?: number
          ymediaintitule: string
          ymediaurl: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymediaboolphotoeditoriale?: boolean | null
          ymediaboolphotoevent?: string
          ymediaboolphotoprod?: string
          ymediaboolvideo?: boolean
          ymediaboolvideocapsule?: string
          ymediacode?: string
          ymediaid?: number
          ymediaintitule?: string
          ymediaurl?: string
        }
        Relationships: []
      }
      yobjet3d: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yobjet3did: number
          yobjet3durl: string
          yvarprodidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yobjet3did?: number
          yobjet3durl: string
          yvarprodidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yobjet3did?: number
          yobjet3durl?: string
          yvarprodidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "yobjet3d_yvarprodidfk_fkey"
            columns: ["yvarprodidfk"]
            isOneToOne: false
            referencedRelation: "yvarprod"
            referencedColumns: ["yvarprodid"]
          },
        ]
      }
      ypanier: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ypanierid: number
          ypanierqte: number
          yuseridfk: string
          yvarprodidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ypanierid: number
          ypanierqte: number
          yuseridfk: string
          yvarprodidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ypanierid?: number
          ypanierqte?: number
          yuseridfk?: string
          yvarprodidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "ypanier_yvarprodidfk_fkey"
            columns: ["yvarprodidfk"]
            isOneToOne: false
            referencedRelation: "yvarprod"
            referencedColumns: ["yvarprodid"]
          },
        ]
      }
      yprod: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xcategprodidfk: number | null
          ydesignidfk: number
          yinfospotactionsidfk: number | null
          yprodcode: string
          yproddetailstech: string
          yprodid: number
          yprodinfobulle: string
          yprodintitule: string
          yprodstatut: Database["morpheus"]["Enums"]["product_status"]
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcategprodidfk?: number | null
          ydesignidfk: number
          yinfospotactionsidfk?: number | null
          yprodcode: string
          yproddetailstech: string
          yprodid?: number
          yprodinfobulle: string
          yprodintitule: string
          yprodstatut?: Database["morpheus"]["Enums"]["product_status"]
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcategprodidfk?: number | null
          ydesignidfk?: number
          yinfospotactionsidfk?: number | null
          yprodcode?: string
          yproddetailstech?: string
          yprodid?: number
          yprodinfobulle?: string
          yprodintitule?: string
          yprodstatut?: Database["morpheus"]["Enums"]["product_status"]
        }
        Relationships: [
          {
            foreignKeyName: "yprod_xcategprodidfk_fkey"
            columns: ["xcategprodidfk"]
            isOneToOne: false
            referencedRelation: "xcategprod"
            referencedColumns: ["xcategprodid"]
          },
          {
            foreignKeyName: "yprod_ydesignidfk_fkey"
            columns: ["ydesignidfk"]
            isOneToOne: false
            referencedRelation: "ydesign"
            referencedColumns: ["ydesignid"]
          },
          {
            foreignKeyName: "yprod_yinfospotactionsidfk_fkey"
            columns: ["yinfospotactionsidfk"]
            isOneToOne: false
            referencedRelation: "yinfospotactions"
            referencedColumns: ["yinfospotactionsid"]
          },
        ]
      }
      yscenelinks: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yscenelinksaxexyaw: number
          yscenelinksaxeypitch: number
          yscenelinksid: number
          yscenelinksname: string
          yscenesidfkactuelle: number | null
          yscenesidfktarget: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yscenelinksaxexyaw: number
          yscenelinksaxeypitch: number
          yscenelinksid?: number
          yscenelinksname: string
          yscenesidfkactuelle?: number | null
          yscenesidfktarget: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yscenelinksaxexyaw?: number
          yscenelinksaxeypitch?: number
          yscenelinksid?: number
          yscenelinksname?: string
          yscenesidfkactuelle?: number | null
          yscenesidfktarget?: number
        }
        Relationships: [
          {
            foreignKeyName: "yscenelinks_yscenesidfkactuelle_fkey"
            columns: ["yscenesidfkactuelle"]
            isOneToOne: false
            referencedRelation: "yscenes"
            referencedColumns: ["yscenesid"]
          },
          {
            foreignKeyName: "yscenelinks_yscenesidfktarget_fkey"
            columns: ["yscenesidfktarget"]
            isOneToOne: false
            referencedRelation: "yscenes"
            referencedColumns: ["yscenesid"]
          },
        ]
      }
      yscenes: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yboutiqueidfk: number | null
          yscenesaxexyaw: number
          yscenesaxeypitch: number
          yscenesid: number
          yscenesname: string
          yscenespanorama: string
          ysceneszoomfov: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueidfk?: number | null
          yscenesaxexyaw: number
          yscenesaxeypitch: number
          yscenesid?: number
          yscenesname: string
          yscenespanorama: string
          ysceneszoomfov: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueidfk?: number | null
          yscenesaxexyaw?: number
          yscenesaxeypitch?: number
          yscenesid?: number
          yscenesname?: string
          yscenespanorama?: string
          ysceneszoomfov?: number
        }
        Relationships: [
          {
            foreignKeyName: "yscenes_yboutiqueidfk_fkey"
            columns: ["yboutiqueidfk"]
            isOneToOne: false
            referencedRelation: "yboutique"
            referencedColumns: ["yboutiqueid"]
          },
        ]
      }
      yvarprod: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xcouleuridfk: number
          xdeviseidfk: number | null
          xtailleidfk: number
          yprodidfk: number | null
          yvarprodcode: string
          yvarprodgenre: string
          yvarprodid: number
          yvarprodintitule: string
          yvarprodnbrjourlivraison: number
          yvarprodprixcatalogue: number
          yvarprodprixpromotion: number | null
          yvarprodpromotiondatedeb: string | null
          yvarprodpromotiondatefin: string | null
          yvarprodstatut: Database["morpheus"]["Enums"]["product_status"]
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcouleuridfk: number
          xdeviseidfk?: number | null
          xtailleidfk: number
          yprodidfk?: number | null
          yvarprodcode: string
          yvarprodgenre: string
          yvarprodid?: number
          yvarprodintitule: string
          yvarprodnbrjourlivraison: number
          yvarprodprixcatalogue?: number
          yvarprodprixpromotion?: number | null
          yvarprodpromotiondatedeb?: string | null
          yvarprodpromotiondatefin?: string | null
          yvarprodstatut?: Database["morpheus"]["Enums"]["product_status"]
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcouleuridfk?: number
          xdeviseidfk?: number | null
          xtailleidfk?: number
          yprodidfk?: number | null
          yvarprodcode?: string
          yvarprodgenre?: string
          yvarprodid?: number
          yvarprodintitule?: string
          yvarprodnbrjourlivraison?: number
          yvarprodprixcatalogue?: number
          yvarprodprixpromotion?: number | null
          yvarprodpromotiondatedeb?: string | null
          yvarprodpromotiondatefin?: string | null
          yvarprodstatut?: Database["morpheus"]["Enums"]["product_status"]
        }
        Relationships: [
          {
            foreignKeyName: "yvarprod_xcouleuridfk_fkey"
            columns: ["xcouleuridfk"]
            isOneToOne: false
            referencedRelation: "xcouleur"
            referencedColumns: ["xcouleurid"]
          },
          {
            foreignKeyName: "yvarprod_xdeviseidfk_fkey"
            columns: ["xdeviseidfk"]
            isOneToOne: false
            referencedRelation: "xdevise"
            referencedColumns: ["xdeviseid"]
          },
          {
            foreignKeyName: "yvarprod_xtailleidfk_fkey"
            columns: ["xtailleidfk"]
            isOneToOne: false
            referencedRelation: "xtaille"
            referencedColumns: ["xtailleid"]
          },
          {
            foreignKeyName: "yvarprod_yprodidfk_fkey"
            columns: ["yprodidfk"]
            isOneToOne: false
            referencedRelation: "yprod"
            referencedColumns: ["yprodid"]
          },
        ]
      }
      yvarprodmedia: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ymediaidfk: number
          yvarprodidfk: number
          yvarprodmediaid: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymediaidfk: number
          yvarprodidfk: number
          yvarprodmediaid?: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymediaidfk?: number
          yvarprodidfk?: number
          yvarprodmediaid?: number
        }
        Relationships: [
          {
            foreignKeyName: "yvarprodmedia_ymediaidfk_fkey"
            columns: ["ymediaidfk"]
            isOneToOne: false
            referencedRelation: "ymedia"
            referencedColumns: ["ymediaid"]
          },
          {
            foreignKeyName: "yvarprodmedia_yvarprodidfk_fkey"
            columns: ["yvarprodidfk"]
            isOneToOne: false
            referencedRelation: "yvarprod"
            referencedColumns: ["yvarprodid"]
          },
        ]
      }
      yvisite: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ydetailseventidfk: number
          yvisiteid: number
          yvisiteuridfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydetailseventidfk: number
          yvisiteid: number
          yvisiteuridfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydetailseventidfk?: number
          yvisiteid?: number
          yvisiteuridfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "yvisite_ydetailseventidfk_fkey"
            columns: ["ydetailseventidfk"]
            isOneToOne: false
            referencedRelation: "ydetailsevent"
            referencedColumns: ["ydetailseventid"]
          },
          {
            foreignKeyName: "yvisite_yvisiteuridfk_fkey"
            columns: ["yvisiteuridfk"]
            isOneToOne: false
            referencedRelation: "yvisiteur"
            referencedColumns: ["yvisiteurid"]
          },
        ]
      }
      yvisiteur: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yuseridfk: string
          yvisiteuradresse: string | null
          yvisiteurboolacheteurluxe: string
          yvisiteurboolacheteurpro: string
          yvisiteurboolartisan: string
          yvisiteurboolclientprive: string
          yvisiteurboolcollectionneur: string
          yvisiteurboolcreateur: string
          yvisiteurboolculturel: string
          yvisiteurboolgrandpublic: string
          yvisiteurboolinfluenceur: string
          yvisiteurboolinvestisseur: string
          yvisiteurbooljournaliste: string
          yvisiteurboolpressespecialisee: string
          yvisiteurboolvip: string
          yvisiteurcode: string
          yvisiteuremail: string | null
          yvisiteurid: number
          yvisiteurnom: string
          yvisiteurtelephone: string | null
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yuseridfk: string
          yvisiteuradresse?: string | null
          yvisiteurboolacheteurluxe: string
          yvisiteurboolacheteurpro: string
          yvisiteurboolartisan: string
          yvisiteurboolclientprive: string
          yvisiteurboolcollectionneur: string
          yvisiteurboolcreateur: string
          yvisiteurboolculturel: string
          yvisiteurboolgrandpublic: string
          yvisiteurboolinfluenceur: string
          yvisiteurboolinvestisseur: string
          yvisiteurbooljournaliste: string
          yvisiteurboolpressespecialisee: string
          yvisiteurboolvip: string
          yvisiteurcode: string
          yvisiteuremail?: string | null
          yvisiteurid?: number
          yvisiteurnom: string
          yvisiteurtelephone?: string | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yuseridfk?: string
          yvisiteuradresse?: string | null
          yvisiteurboolacheteurluxe?: string
          yvisiteurboolacheteurpro?: string
          yvisiteurboolartisan?: string
          yvisiteurboolclientprive?: string
          yvisiteurboolcollectionneur?: string
          yvisiteurboolcreateur?: string
          yvisiteurboolculturel?: string
          yvisiteurboolgrandpublic?: string
          yvisiteurboolinfluenceur?: string
          yvisiteurboolinvestisseur?: string
          yvisiteurbooljournaliste?: string
          yvisiteurboolpressespecialisee?: string
          yvisiteurboolvip?: string
          yvisiteurcode?: string
          yvisiteuremail?: string | null
          yvisiteurid?: number
          yvisiteurnom?: string
          yvisiteurtelephone?: string | null
        }
        Relationships: []
      }
      ywishlist: {
        Row: {
          sysaction: string
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string
          yuseridfk: string
          yvarprodidfk: number
          ywishlistid: number
        }
        Insert: {
          sysaction: string
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser: string
          yuseridfk: string
          yvarprodidfk: number
          ywishlistid: number
        }
        Update: {
          sysaction?: string
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string
          yuseridfk?: string
          yvarprodidfk?: number
          ywishlistid?: number
        }
        Relationships: [
          {
            foreignKeyName: "ywishlist_yvarprodidfk_fkey"
            columns: ["yvarprodidfk"]
            isOneToOne: false
            referencedRelation: "yvarprod"
            referencedColumns: ["yvarprodid"]
          },
        ]
      }
      zdetailscommande: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ycompteidfk: number | null
          yvarprodidfk: number
          zcommandedate: string
          zcommandeid: number
          zcommandeligneno: number
          zcommandelivraisondate: string
          zcommandeno: string
          zcommandequantite: number
          zcommandestatut: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ycompteidfk?: number | null
          yvarprodidfk: number
          zcommandedate: string
          zcommandeid?: number
          zcommandeligneno: number
          zcommandelivraisondate: string
          zcommandeno: string
          zcommandequantite: number
          zcommandestatut: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ycompteidfk?: number | null
          yvarprodidfk?: number
          zcommandedate?: string
          zcommandeid?: number
          zcommandeligneno?: number
          zcommandelivraisondate?: string
          zcommandeno?: string
          zcommandequantite?: number
          zcommandestatut?: string
        }
        Relationships: [
          {
            foreignKeyName: "zdetailscommande_ycompteidfk_fkey"
            columns: ["ycompteidfk"]
            isOneToOne: false
            referencedRelation: "ycompte"
            referencedColumns: ["ycompteid"]
          },
          {
            foreignKeyName: "zdetailscommande_yvarprodidfk_fkey"
            columns: ["yvarprodidfk"]
            isOneToOne: false
            referencedRelation: "yvarprod"
            referencedColumns: ["yvarprodid"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_system_columns: {
        Args: { table_name: string }
        Returns: string
      }
      add_system_columns_to_all: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      apply_system_triggers: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      product_status: "approved" | "not_approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  morpheus: {
    Enums: {
      product_status: ["approved", "not_approved", "rejected"],
    },
  },
  public: {
    Enums: {},
  },
} as const
