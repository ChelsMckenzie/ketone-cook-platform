export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LocationType = "rural" | "semi_urban" | "city";

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";

export type JournalEntryType = "meal_note" | "personal_note" | "ketone_reading";

export interface MacroData {
  carbs?: number;
  protein?: number;
  fat?: number;
  calories?: number;
  vegetables?: number;
  proteins?: number;
  carb_warning?: string;
  energy_level?: number;
  mood?: number;
  ketone_reading?: number;
}

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string;
          user_name: string | null;
          full_name: string | null;
          email: string;
          dob: string | null;
          gender: string | null;
          last_period_end: string | null;
          location_type: LocationType | null;
          address: string | null;
          activity_level: ActivityLevel | null;
          fasting_goal: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_name?: string | null;
          full_name?: string | null;
          email: string;
          dob?: string | null;
          gender?: string | null;
          last_period_end?: string | null;
          location_type?: LocationType | null;
          address?: string | null;
          activity_level?: ActivityLevel | null;
          fasting_goal?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_name?: string | null;
          full_name?: string | null;
          email?: string;
          dob?: string | null;
          gender?: string | null;
          last_period_end?: string | null;
          location_type?: LocationType | null;
          address?: string | null;
          activity_level?: ActivityLevel | null;
          fasting_goal?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          title: string;
          ingredients: Json;
          instructions: string | null;
          cooking_time: number | null;
          difficulty: string | null;
          category: string | null;
          macros: Json | null;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          title: string;
          ingredients: Json;
          instructions?: string | null;
          cooking_time?: number | null;
          difficulty?: string | null;
          category?: string | null;
          macros?: Json | null;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          title?: string;
          ingredients?: Json;
          instructions?: string | null;
          cooking_time?: number | null;
          difficulty?: string | null;
          category?: string | null;
          macros?: Json | null;
          is_public?: boolean;
        };
      };
      logs: {
        Row: {
          id: string;
          user_id: string;
          type: JournalEntryType;
          content: string;
          image_url: string | null;
          macros: MacroData | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: JournalEntryType;
          content: string;
          image_url?: string | null;
          macros?: MacroData | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: JournalEntryType;
          content?: string;
          image_url?: string | null;
          macros?: MacroData | null;
          created_at?: string;
        };
      };
      recipe_favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      location_type: LocationType;
      activity_level: ActivityLevel;
      journal_entry_type: JournalEntryType;
    };
  };
}

// Helper types for easier access
export type Profile = Database["public"]["Tables"]["profile"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profile"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profile"]["Update"];

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
export type RecipeUpdate = Database["public"]["Tables"]["recipes"]["Update"];

export type Log = Database["public"]["Tables"]["logs"]["Row"];
export type LogInsert = Database["public"]["Tables"]["logs"]["Insert"];
export type LogUpdate = Database["public"]["Tables"]["logs"]["Update"];

export type RecipeFavorite = Database["public"]["Tables"]["recipe_favorites"]["Row"];
export type RecipeFavoriteInsert = Database["public"]["Tables"]["recipe_favorites"]["Insert"];
