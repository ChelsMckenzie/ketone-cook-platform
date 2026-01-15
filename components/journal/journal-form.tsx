"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";
import { createJournalEntry } from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOURNAL_ENTRY_TYPES } from "@/lib/constants";

const journalSchema = z.object({
  type: z.enum(["meal_note", "personal_note", "ketone_reading"]),
  content: z.string().min(1, "Content is required"),
  energy_level: z.number().min(1).max(9).optional(),
  mood: z.number().min(1).max(9).optional(),
  ketone_reading: z.number().min(0).optional(),
  linked_meal_id: z.string().optional(),
});

type JournalFormValues = z.infer<typeof journalSchema>;

interface MealLog {
  id: string;
  content: string;
  created_at: string;
  image_url: string | null;
}

interface JournalFormProps {
  mealLogs: MealLog[];
}

export function JournalForm({ mealLogs }: JournalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      type: "personal_note",
      content: "",
      energy_level: undefined,
      mood: undefined,
      ketone_reading: undefined,
      linked_meal_id: undefined,
    },
  });

  const entryType = form.watch("type");

  const onSubmit = async (data: JournalFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("content", data.content);

      if (data.energy_level !== undefined) {
        formData.append("energy_level", String(data.energy_level));
      }
      if (data.mood !== undefined) {
        formData.append("mood", String(data.mood));
      }
      if (data.ketone_reading !== undefined) {
        formData.append("ketone_reading", String(data.ketone_reading));
      }
      if (data.linked_meal_id && data.linked_meal_id !== "none") {
        formData.append("linked_meal_id", data.linked_meal_id);
      }

      const result = await createJournalEntry(formData);

      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
        form.reset();
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("Failed to create journal entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <h2 className="mb-4 text-xl font-semibold rainbow-text">New Entry</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          Entry saved successfully!
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entry type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ketone_reading">
                      Ketone Reading
                    </SelectItem>
                    <SelectItem value="personal_note">Personal Note</SelectItem>
                    <SelectItem value="meal_note">Meal Note</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      entryType === "ketone_reading"
                        ? "Notes about your ketone reading..."
                        : entryType === "meal_note"
                          ? "Describe your meal..."
                          : "How are you feeling today?"
                    }
                    {...field}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {entryType === "ketone_reading" && (
            <FormField
              control={form.control}
              name="ketone_reading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ketone Reading (mmol/L)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 1.5"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your blood ketone reading
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {entryType === "meal_note" && (
            <FormField
              control={form.control}
              name="linked_meal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Previous Meal (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            mealLogs.length === 0
                              ? "No previous meals found"
                              : "Select a meal to link"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="none">None - New meal note</SelectItem>
                      {mealLogs.length > 0 ? (
                        mealLogs.map((meal) => {
                          const mealName = meal.content.split("\n")[0] || "Meal";
                          const date = new Date(meal.created_at).toLocaleDateString(
                            "en-ZA",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          );
                          return (
                            <SelectItem key={meal.id} value={meal.id}>
                              {mealName} ({date})
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="no-meals" disabled>
                          No previous meals available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {mealLogs.length === 0
                      ? "Log meals using the Meal Logger to link them here"
                      : "Link this journal entry to a previously logged meal"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {entryType === "personal_note" && (
            <>
              <FormField
                control={form.control}
                name="energy_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Level (1-9)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={9}
                        placeholder="1 = Low, 9 = High"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood (1-9)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={9}
                        placeholder="1 = Low, 9 = Great"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
