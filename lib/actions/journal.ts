"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types/actions";
import { JOURNAL_ENTRY_TYPES } from "@/lib/constants";
import type { MacroData, JournalEntryType, LogInsert } from "@/types/database";

export interface JournalEntryData {
  type: JournalEntryType;
  content: string;
  image_url?: string;
  macros?: MacroData;
  energy_level?: number;
  mood?: number;
  ketone_reading?: number;
}

export async function createJournalEntry(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to create journal entries.",
    };
  }

  // Extract data from FormData
  const type = formData.get("type") as string;
  const content = formData.get("content") as string;
  const energy_level = formData.get("energy_level")
    ? Number(formData.get("energy_level"))
    : undefined;
  const mood = formData.get("mood") ? Number(formData.get("mood")) : undefined;
  const ketone_reading = formData.get("ketone_reading")
    ? Number(formData.get("ketone_reading"))
    : undefined;

  if (!type || !content) {
    return {
      success: false,
      error: "Type and content are required.",
    };
  }

  // Validate type matches allowed values
  if (!JOURNAL_ENTRY_TYPES.includes(type as JournalEntryType)) {
    return {
      success: false,
      error: `Invalid journal entry type: ${type}. Allowed types: ${JOURNAL_ENTRY_TYPES.join(", ")}`,
    };
  }

  // Prepare macros data
  const macrosData: MacroData = {};
  if (energy_level !== undefined) {
    macrosData.energy_level = energy_level;
  }
  if (mood !== undefined) {
    macrosData.mood = mood;
  }
  if (ketone_reading !== undefined) {
    macrosData.ketone_reading = ketone_reading;
  }

  const logData: LogInsert = {
    user_id: user.id,
    type: type as JournalEntryType,
    content: content,
    image_url: null,
    macros: Object.keys(macrosData).length > 0 ? macrosData : null,
  };

  // Type assertion needed due to Supabase type inference limitations
  const { data: insertedData, error } = await (supabase
    .from("logs") as any)
    .insert(logData)
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Failed to create journal entry.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/journal");

  return {
    success: true,
    data: { id: insertedData.id },
  };
}
