// Standardized action result types

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// Specific result types for different actions
export interface RecipeResult {
  id: string;
  title: string;
}

export interface MealLogResult {
  id: string;
  created_at: string;
}

export interface JournalEntryResult {
  id: string;
  created_at: string;
}

// AI-related types
export interface GeneratedRecipe {
  title: string;
  ingredients: Array<{ name: string; amount: string }>;
  instructions: string;
  macros: MacroData;
  cooking_time: number;
  difficulty: "easy" | "medium" | "hard";
  category: "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
}

export interface MacroData {
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
}

export interface MealAnalysisResult {
  vegetables: number;
  proteins: number;
  estimatedMacros: MacroData;
  carbWarning: string | null;
  description: string;
}

// Profile types
export interface ProfileData {
  full_name: string | null;
  dob: string | null;
  gender: string | null;
  last_period_end: string | null;
  city: string | null;
  fasting_goal: number | null;
}

export interface ProfileCheckData {
  full_name: string | null;
  city: string | null;
  fasting_goal: number | null;
}
