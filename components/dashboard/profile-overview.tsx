"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit2, Save, X } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOUTH_AFRICAN_CITIES } from "@/lib/constants";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  last_period_end: z.string().optional(),
  city: z.string().min(1, "City is required"),
  fasting_goal: z.number().min(0, "Fasting goal must be a positive number"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileOverviewProps {
  profile: {
    full_name: string | null;
    dob: string | null;
    gender: string | null;
    last_period_end: string | null;
    city: string | null;
    fasting_goal: number | null;
  };
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      dob: profile.dob || "",
      gender: (profile.gender as "Male" | "Female" | "Other") || undefined,
      last_period_end: profile.last_period_end || "",
      city: profile.city || "",
      fasting_goal: profile.fasting_goal || 16,
    },
  });

  const gender = form.watch("gender");

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfile({
        full_name: data.full_name,
        dob: data.dob,
        gender: data.gender,
        last_period_end: data.last_period_end,
        city: data.city,
        fasting_goal: data.fasting_goal,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-primary/30 bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            Profile updated successfully!
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {gender === "Female" && (
              <FormField
                control={form.control}
                name="last_period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Last Bleeding Day</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used to calculate your cycle phase for fasting
                      recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {SOUTH_AFRICAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your city in South Africa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fasting_goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fasting Goal (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Your target intermittent fasting window (e.g., 16 for 16:8)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm rainbow-accent">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold rainbow-text">Profile Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="hover:border-primary"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
          <p className="text-base">{profile.full_name || "Not set"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Date of Birth
          </p>
          <p className="text-base">{formatDate(profile.dob)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Gender</p>
          <p className="text-base">{profile.gender || "Not set"}</p>
        </div>
        {profile.gender === "Female" && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Last Period End
            </p>
            <p className="text-base">{formatDate(profile.last_period_end)}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground">City</p>
          <p className="text-base">{profile.city || "Not set"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Fasting Goal
          </p>
          <p className="text-base">
            {profile.fasting_goal
              ? `${profile.fasting_goal} hours (${profile.fasting_goal}:${24 - profile.fasting_goal})`
              : "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
}
