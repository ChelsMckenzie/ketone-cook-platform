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
    };
  };
}
