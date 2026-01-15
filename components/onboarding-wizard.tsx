"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
import { updateUserProfile } from "@/lib/actions/user";
import { SOUTH_AFRICAN_CITIES } from "@/lib/constants";

const onboardingSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  last_period_end: z.string().optional(),
  city: z.string().min(1, "City is required"),
  fasting_goal: z.number().min(0, "Fasting goal must be a positive number"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: "",
      dob: "",
      gender: undefined,
      last_period_end: "",
      city: "",
      fasting_goal: 16,
    },
    mode: "onChange",
  });

  const gender = form.watch("gender");
  const totalSteps = gender === "Female" ? 4 : 3; // Step 1: Name/DOB, Step 2: Gender, Step 3: Period (if Female) or Address, Step 4: Address (if Female) or Fasting Goal, Step 5: Fasting Goal (if Female)

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsSubmitting(true);
    try {
      const result =       await updateUserProfile({
        full_name: data.full_name,
        dob: data.dob,
        gender: data.gender,
        last_period_end: data.last_period_end,
        city: data.city,
        fasting_goal: data.fasting_goal,
      });

      // If the server action returns an error, handle it
      if (result && "error" in result && result.error) {
        console.error("Error submitting form:", result.error);
        setIsSubmitting(false);
        return;
      }

      // If successful, redirect to dashboard
      // Note: redirect() in server actions throws, so we handle navigation client-side
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      // Check if it's a Next.js redirect (which is expected)
      if (error && typeof error === "object" && "digest" in error) {
        // This is a Next.js redirect, let it propagate
        throw error;
      }
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["full_name", "dob"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["gender"];
    } else if (currentStep === 3) {
      if (gender === "Female") {
        fieldsToValidate = ["last_period_end"];
      } else {
        // For non-Female, step 3 is the final step with City/Fasting
        fieldsToValidate = ["city", "fasting_goal"];
      }
    } else if (currentStep === 4) {
      // Final step for Female users
      fieldsToValidate = ["city", "fasting_goal"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold rainbow-text">Welcome to KetoMate</h1>
        <p className="text-muted-foreground">
          Let's set up your profile to get started 🌟
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = currentStep === step;
          const isCompleted = currentStep > step;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110"
                    : isCompleted
                      ? "border-primary bg-primary text-primary-foreground rainbow-gradient"
                      : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? "✓" : step}
              </div>
              {step < totalSteps && (
                <div
                  className={`h-1 flex-1 transition-all ${
                    isCompleted ? "bg-primary rainbow-gradient" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Name and DOB */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
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
                    <FormDescription>
                      We use this to personalize your experience
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Gender */}
          {currentStep === 2 && (
            <div className="space-y-6">
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
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This helps us provide cycle-aware fasting insights
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Last Period End (Conditional - only if Female) */}
          {currentStep === 3 && gender === "Female" && (
            <div className="space-y-6">
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
                      This helps us calculate your cycle phase for fasting
                      recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 4 (or Step 3 if not Female): City, Fasting Goal */}
          {((currentStep === 4 && gender === "Female") ||
            (currentStep === 3 && gender !== "Female")) && (
            <div className="space-y-6">
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
                        placeholder="e.g., 16"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Your target intermittent fasting window (e.g., 16 for
                      16:8)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
