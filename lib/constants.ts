// Application Constants

// Fasting
export const FASTING_DEFAULT_HOURS = 16;
export const FASTING_MIN_HOURS = 12;
export const FASTING_MAX_HOURS = 24;

// Images
export const MAX_IMAGE_SIZE_BYTES = 5_000_000; // 5MB
export const COMPRESSED_IMAGE_MAX_BYTES = 900_000; // 900KB
export const IMAGE_COMPRESSION_QUALITY = 0.8;
export const IMAGE_COMPRESSION_FALLBACK_QUALITY = 0.6;
export const IMAGE_MAX_DIMENSION = 1024;

// Pagination
export const RECIPES_PAGE_SIZE = 10;
export const JOURNAL_ENTRIES_LIMIT = 5;
export const MEAL_LOGS_LIMIT = 20;

// Journal Entry Types
export const JOURNAL_ENTRY_TYPES = [
  "meal_note",
  "personal_note",
  "ketone_reading",
] as const;

export type JournalEntryType = (typeof JOURNAL_ENTRY_TYPES)[number];

// Profile Required Fields
export const REQUIRED_PROFILE_FIELDS = [
  "full_name",
  "address",
  "fasting_goal",
] as const;

// Recipe Categories
export const RECIPE_CATEGORIES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

// Recipe Difficulties
export const RECIPE_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

// Keto Thresholds
export const KETO_MAX_CARBS_PER_SERVING = 20;

// Cycle Phases
export const CYCLE_PHASES = {
  MENSTRUAL: { start: 1, end: 5, name: "Menstrual" },
  FOLLICULAR: { start: 6, end: 14, name: "Follicular" },
  OVULATION: { start: 14, end: 16, name: "Ovulation" },
  LUTEAL: { start: 17, end: 28, name: "Luteal" },
} as const;

export const AVERAGE_CYCLE_LENGTH = 28;
