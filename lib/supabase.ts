export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  morpheus: {
    Tables: {
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
          yboutiqueid: number
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
            foreignKeyName: "fk_ymall"
            columns: ["ymallidfk"]
            isOneToOne: false
            referencedRelation: "ymall"
            referencedColumns: ["ymallid"]
          },
        ]
      }
      ydesigneur: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ydesigneuractivitedate: string | null
          ydesigneurcode: string
          ydesigneurcontactemail: string
          ydesigneurcontactpersonne: string
          ydesigneurcontacttelephone: string
          ydesigneurcouleur1codehexa: string | null
          ydesigneurcouleur1codervb: string | null
          ydesigneurcouleur1dsg: string | null
          ydesigneurcouleur2codehexa: string | null
          ydesigneurcouleur2codervb: string | null
          ydesigneurcouleur2dsg: string | null
          ydesigneurcouleur3codehexa: string | null
          ydesigneurcouleur3codervb: string | null
          ydesigneurcouleur3dsg: string | null
          ydesigneurid: number
          ydesigneurmarque: string
          ydesigneurmorpheusdate: string
          ydesigneurnom: string
          ydesigneurpays: string
          ydesigneurspecialite: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydesigneuractivitedate?: string | null
          ydesigneurcode: string
          ydesigneurcontactemail: string
          ydesigneurcontactpersonne: string
          ydesigneurcontacttelephone: string
          ydesigneurcouleur1codehexa?: string | null
          ydesigneurcouleur1codervb?: string | null
          ydesigneurcouleur1dsg?: string | null
          ydesigneurcouleur2codehexa?: string | null
          ydesigneurcouleur2codervb?: string | null
          ydesigneurcouleur2dsg?: string | null
          ydesigneurcouleur3codehexa?: string | null
          ydesigneurcouleur3codervb?: string | null
          ydesigneurcouleur3dsg?: string | null
          ydesigneurid: number
          ydesigneurmarque: string
          ydesigneurmorpheusdate: string
          ydesigneurnom: string
          ydesigneurpays: string
          ydesigneurspecialite: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydesigneuractivitedate?: string | null
          ydesigneurcode?: string
          ydesigneurcontactemail?: string
          ydesigneurcontactpersonne?: string
          ydesigneurcontacttelephone?: string
          ydesigneurcouleur1codehexa?: string | null
          ydesigneurcouleur1codervb?: string | null
          ydesigneurcouleur1dsg?: string | null
          ydesigneurcouleur2codehexa?: string | null
          ydesigneurcouleur2codervb?: string | null
          ydesigneurcouleur2dsg?: string | null
          ydesigneurcouleur3codehexa?: string | null
          ydesigneurcouleur3codervb?: string | null
          ydesigneurcouleur3dsg?: string | null
          ydesigneurid?: number
          ydesigneurmarque?: string
          ydesigneurmorpheusdate?: string
          ydesigneurnom?: string
          ydesigneurpays?: string
          ydesigneurspecialite?: string
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
          ydesigneuridfk: number | null
          ydetailseventid: number
          yeventidfk: number
          ymallidfk: number
          yproduitidfk: number | null
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueidfk?: number | null
          ydesigneuridfk?: number | null
          ydetailseventid: number
          yeventidfk: number
          ymallidfk: number
          yproduitidfk?: number | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yboutiqueidfk?: number | null
          ydesigneuridfk?: number | null
          ydetailseventid?: number
          yeventidfk?: number
          ymallidfk?: number
          yproduitidfk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_yboutique"
            columns: ["yboutiqueidfk"]
            isOneToOne: false
            referencedRelation: "yboutique"
            referencedColumns: ["yboutiqueid"]
          },
          {
            foreignKeyName: "fk_ydesigneur"
            columns: ["ydesigneuridfk"]
            isOneToOne: false
            referencedRelation: "ydesigneur"
            referencedColumns: ["ydesigneurid"]
          },
          {
            foreignKeyName: "fk_yevent"
            columns: ["yeventidfk"]
            isOneToOne: true
            referencedRelation: "yevent"
            referencedColumns: ["yeventid"]
          },
          {
            foreignKeyName: "fk_ymall"
            columns: ["ymallidfk"]
            isOneToOne: false
            referencedRelation: "ymall"
            referencedColumns: ["ymallid"]
          },
          {
            foreignKeyName: "fk_yproduit"
            columns: ["yproduitidfk"]
            isOneToOne: false
            referencedRelation: "yproduit"
            referencedColumns: ["yproduitid"]
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
          yvideoidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventcode: string
          yeventdatedeb: string
          yeventdatefin: string
          yeventid: number
          yeventintitule: string
          yvideoidfk: number
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
          yvideoidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_yvideo"
            columns: ["yvideoidfk"]
            isOneToOne: false
            referencedRelation: "yvideo"
            referencedColumns: ["yvideoid"]
          },
        ]
      }
      ymall: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string
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
          sysdate: string
          sysuser?: string | null
          ymalladresse: string
          ymallcode: string
          ymallcontactemail: string
          ymallcontactpersonne: string
          ymallcontacttelephone: string
          ymallid: number
          ymallintitule: string
          ymalllocalisation: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string
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
      ymannequinproduit: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yeventidfk: number
          ymannequinidfk: number
          ymannequinproduitdate: string
          ymannequinproduitid: number
          yproduitidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventidfk: number
          ymannequinidfk: number
          ymannequinproduitdate: string
          ymannequinproduitid: number
          yproduitidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yeventidfk?: number
          ymannequinidfk?: number
          ymannequinproduitdate?: string
          ymannequinproduitid?: number
          yproduitidfk?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_yevent"
            columns: ["yeventidfk"]
            isOneToOne: true
            referencedRelation: "yevent"
            referencedColumns: ["yeventid"]
          },
          {
            foreignKeyName: "fk_ymannequin"
            columns: ["ymannequinidfk"]
            isOneToOne: false
            referencedRelation: "ymannequin"
            referencedColumns: ["ymannequinid"]
          },
          {
            foreignKeyName: "fk_yproduit"
            columns: ["yproduitidfk"]
            isOneToOne: false
            referencedRelation: "yproduit"
            referencedColumns: ["yproduitid"]
          },
        ]
      }
      yobjet3d: {
        Row: {
          couleur: string | null
          created_at: string
          id: number
          order: number | null
          produit_id: number | null
          url: string | null
        }
        Insert: {
          couleur?: string | null
          created_at?: string
          id?: number
          order?: number | null
          produit_id?: number | null
          url?: string | null
        }
        Update: {
          couleur?: string | null
          created_at?: string
          id?: number
          order?: number | null
          produit_id?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yobjet3d_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "yproduit"
            referencedColumns: ["yproduitid"]
          },
        ]
      }
      yphoto: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yphotobooleditoriale: string
          yphotocode: string
          yphotodate: string
          yphotoid: number
          yphotointitule: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yphotobooleditoriale: string
          yphotocode: string
          yphotodate: string
          yphotoid: number
          yphotointitule: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yphotobooleditoriale?: string
          yphotocode?: string
          yphotodate?: string
          yphotoid?: number
          yphotointitule?: string
        }
        Relationships: []
      }
      yproduit: {
        Row: {
          imageurl: string | null
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ydesigneuridfk: number | null
          yproduitcode: string
          yproduitdetailstech: string
          yproduitid: number
          yproduitinfobulle: string
          yproduitintitule: string
          yvideoidfk: number | null
        }
        Insert: {
          imageurl?: string | null
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydesigneuridfk?: number | null
          yproduitcode: string
          yproduitdetailstech: string
          yproduitid?: number
          yproduitinfobulle: string
          yproduitintitule: string
          yvideoidfk?: number | null
        }
        Update: {
          imageurl?: string | null
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydesigneuridfk?: number | null
          yproduitcode?: string
          yproduitdetailstech?: string
          yproduitid?: number
          yproduitinfobulle?: string
          yproduitintitule?: string
          yvideoidfk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ydesigneur"
            columns: ["ydesigneuridfk"]
            isOneToOne: false
            referencedRelation: "ydesigneur"
            referencedColumns: ["ydesigneurid"]
          },
          {
            foreignKeyName: "fk_yvideo"
            columns: ["yvideoidfk"]
            isOneToOne: false
            referencedRelation: "yvideo"
            referencedColumns: ["yvideoid"]
          },
        ]
      }
      yvideo: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yvideoboolcapsule: string
          yvideoboolevent: string
          yvideoboolproduit: string
          yvideocode: string
          yvideodate: string
          yvideoid: number
          yvideointitule: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yvideoboolcapsule: string
          yvideoboolevent: string
          yvideoboolproduit: string
          yvideocode: string
          yvideodate: string
          yvideoid: number
          yvideointitule: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yvideoboolcapsule?: string
          yvideoboolevent?: string
          yvideoboolproduit?: string
          yvideocode?: string
          yvideodate?: string
          yvideoid?: number
          yvideointitule?: string
        }
        Relationships: []
      }
      yvisite: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          ydetailseventidfk: number
          yvisiteid: number
          yvisiteuridfk: number | null
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydetailseventidfk: number
          yvisiteid: number
          yvisiteuridfk?: number | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ydetailseventidfk?: number
          yvisiteid?: number
          yvisiteuridfk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ydetailevent"
            columns: ["ydetailseventidfk"]
            isOneToOne: false
            referencedRelation: "ydetailsevent"
            referencedColumns: ["ydetailseventid"]
          },
          {
            foreignKeyName: "fk_yvisiteur"
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
          yvisiteurid: number
          yvisiteurnom: string
          yvisiteurtelephone?: string | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  morpheus: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
