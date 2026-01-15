import type { ProfileCheckData } from "@/lib/types/actions";

/**
 * Checks if a user profile has all required fields completed
 */
export function isProfileComplete(profile: ProfileCheckData | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.full_name && profile.city && profile.fasting_goal
  );
}

/**
 * Gets the list of missing required profile fields
 */
export function getMissingProfileFields(
  profile: ProfileCheckData | null
): string[] {
  if (!profile) return ["full_name", "city", "fasting_goal"];

  const missing: string[] = [];
  if (!profile.full_name) missing.push("full_name");
  if (!profile.city) missing.push("city");
  if (!profile.fasting_goal) missing.push("fasting_goal");

  return missing;
}
