export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          pseudo: string;
          reduce_motion: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          pseudo: string;
          reduce_motion?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          pseudo?: string;
          reduce_motion?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      domain_progress: {
        Row: {
          id: string;
          user_id: string;
          domaine: string;
          niveau_courant: number;
          numero_serie: number;
          derniere_activite: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domaine: string;
          niveau_courant?: number;
          numero_serie?: number;
          derniere_activite?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domaine?: string;
          niveau_courant?: number;
          numero_serie?: number;
          derniere_activite?: string;
        };
        Relationships: [];
      };
      answers: {
        Row: {
          id: string;
          user_id: string;
          domaine: string;
          question_id: string;
          niveau: number;
          texte_reponse: string;
          note: number;
          retour_ia: Json;
          fournisseur: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domaine: string;
          question_id: string;
          niveau: number;
          texte_reponse: string;
          note: number;
          retour_ia: Json;
          fournisseur: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domaine?: string;
          question_id?: string;
          niveau?: number;
          texte_reponse?: string;
          note?: number;
          retour_ia?: Json;
          fournisseur?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      level_attempts: {
        Row: {
          id: string;
          user_id: string;
          domaine: string;
          niveau: number;
          note_moyenne: number;
          valide: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domaine: string;
          niveau: number;
          note_moyenne: number;
          valide: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domaine?: string;
          niveau?: number;
          note_moyenne?: number;
          valide?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_usage: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          nombre_corrections: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          nombre_corrections?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          nombre_corrections?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
