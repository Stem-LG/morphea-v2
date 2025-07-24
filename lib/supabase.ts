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
          xcategprodid: number
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
          xcouleurid: number
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
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xdeviseboolautorisepaiement: string
          xdevisecodealpha: string
          xdevisecodenum: string
          xdeviseid: number
          xdeviseintitule: string
          xdevisenbrdec: number
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
          xtailleid: number
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
          ycompteid: number
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
          ydesignid: number
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
          ydetailseventid: number
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
          ymediaidfk: number
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
          ymediaidfk: number
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
          ymediaidfk?: number
        }
        Relationships: []
      }
      yinfospotactions: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yboutiqueidfk: number
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
          yboutiqueidfk: number
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
          yboutiqueidfk?: number
          yinfospotactionscustomhandler?: string
          yinfospotactionsdescription?: string
          yinfospotactionsid?: number
          yinfospotactionsmodaltype?: string
          yinfospotactionstitle?: string
          yinfospotactionstype?: string
        }
        Relationships: [
          {
            foreignKeyName: "yinfospotactions_yboutiqueidfk_fkey"
            columns: ["yboutiqueidfk"]
            isOneToOne: false
            referencedRelation: "yboutique"
            referencedColumns: ["yboutiqueid"]
          },
        ]
      }
      yinfospots: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yinfospotactionidfk: number
          yinfospotsaxexyaw: number
          yinfospotsaxeypitch: number
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
          yinfospotsaxexyaw: number
          yinfospotsaxeypitch: number
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
          yinfospotsaxexyaw?: number
          yinfospotsaxeypitch?: number
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
          ymallid: number
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
          ymediaboolphotoevent: string
          ymediaboolphotoprod: string
          ymediaboolvideocapsule: string
          ymediacode: string
          ymediadate: string
          ymediaid: number
          ymediaintitule: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymediaboolphotoevent: string
          ymediaboolphotoprod: string
          ymediaboolvideocapsule: string
          ymediacode: string
          ymediadate: string
          ymediaid: number
          ymediaintitule: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          ymediaboolphotoevent?: string
          ymediaboolphotoprod?: string
          ymediaboolvideocapsule?: string
          ymediacode?: string
          ymediadate?: string
          ymediaid?: number
          ymediaintitule?: string
        }
        Relationships: []
      }
      yobjet3d: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          yobjet3daction: string
          yobjet3dcouleur: string
          yobjet3did: number
          yobjet3dorder: number
          yobjet3durl: string
          yvarprodidfk: number
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yobjet3daction: string
          yobjet3dcouleur: string
          yobjet3did: number
          yobjet3dorder: number
          yobjet3durl: string
          yvarprodidfk: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yobjet3daction?: string
          yobjet3dcouleur?: string
          yobjet3did?: number
          yobjet3dorder?: number
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
          yprodcode: string
          yproddetailstech: string
          yprodid: number
          yprodinfobulle: string
          yprodintitule: string
          yprodstatut: string
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcategprodidfk?: number | null
          ydesignidfk: number
          yprodcode: string
          yproddetailstech: string
          yprodid: number
          yprodinfobulle: string
          yprodintitule: string
          yprodstatut: string
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcategprodidfk?: number | null
          ydesignidfk?: number
          yprodcode?: string
          yproddetailstech?: string
          yprodid?: number
          yprodinfobulle?: string
          yprodintitule?: string
          yprodstatut?: string
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
          yscenelinksid: number
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
          yscenesaxexyaw: number
          yscenesaxeypitch: number
          yscenesid: number
          yscenesname: string
          yscenespanorama: string
          ysceneszoomfov: number
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          yscenesaxexyaw?: number
          yscenesaxeypitch?: number
          yscenesid?: number
          yscenesname?: string
          yscenespanorama?: string
          ysceneszoomfov?: number
        }
        Relationships: []
      }
      yvarprod: {
        Row: {
          sysaction: string | null
          sysadresseip: string | null
          sysdate: string | null
          sysuser: string | null
          xcouleuridfk: number
          xdeviseidfk: number
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
        }
        Insert: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcouleuridfk: number
          xdeviseidfk: number
          xtailleidfk: number
          yprodidfk?: number | null
          yvarprodcode: string
          yvarprodgenre: string
          yvarprodid: number
          yvarprodintitule: string
          yvarprodnbrjourlivraison: number
          yvarprodprixcatalogue: number
          yvarprodprixpromotion?: number | null
          yvarprodpromotiondatedeb?: string | null
          yvarprodpromotiondatefin?: string | null
        }
        Update: {
          sysaction?: string | null
          sysadresseip?: string | null
          sysdate?: string | null
          sysuser?: string | null
          xcouleuridfk?: number
          xdeviseidfk?: number
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
          yvarprodmediaid: number
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
          yuseridfk: string
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
          yuseridfk: string
          yvarprodidfk: number
          zcommandedate: string
          zcommandeid: number
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
          yuseridfk?: string
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
