"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Upload, Loader2, Check } from "lucide-react";
import { analyzeMealImage } from "@/lib/ai/meal-analyzer";
import { logMeal } from "@/lib/actions/meals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { MealAnalysisResult } from "@/lib/types/actions";
import {
  MAX_IMAGE_SIZE_BYTES,
  COMPRESSED_IMAGE_MAX_BYTES,
  IMAGE_COMPRESSION_QUALITY,
  IMAGE_COMPRESSION_FALLBACK_QUALITY,
  IMAGE_MAX_DIMENSION,
} from "@/lib/constants";

const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  image: z.instanceof(File).optional(),
});

type MealFormValues = z.infer<typeof mealSchema>;

export function MealLoggerForm() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
    },
  });

  const compressImage = (
    file: File,
    maxWidth: number = IMAGE_MAX_DIMENSION,
    maxHeight: number = IMAGE_MAX_DIMENSION,
    quality: number = IMAGE_COMPRESSION_QUALITY
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onerror = () => {
          reject(new Error("Failed to read image file"));
        };

        reader.onload = (event) => {
          try {
            const result = event.target?.result;
            if (!result || typeof result !== "string") {
              reject(new Error("Invalid file read result"));
              return;
            }

            const img = new Image();

            img.onerror = () => {
              reject(new Error("Failed to load image"));
            };

            img.onload = () => {
              try {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                  if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                  }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  reject(new Error("Could not get canvas context"));
                  return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Recursive function to compress until under 1MB
                const compressWithQuality = (currentQuality: number): void => {
                  canvas.toBlob(
                    (blob) => {
                      if (!blob) {
                        reject(new Error("Failed to compress image"));
                        return;
                      }

                      if (blob.size > COMPRESSED_IMAGE_MAX_BYTES) {
                        // If still too large, reduce quality further
                        const newQuality = Math.max(0.1, currentQuality - 0.1);
                        if (newQuality >= 0.1) {
                          compressWithQuality(newQuality);
                        } else {
                          reject(
                            new Error(
                              "Unable to compress image to required size. Please try a smaller image."
                            )
                          );
                        }
                      } else {
                        // Successfully compressed to under 1MB
                        const fileReader = new FileReader();
                        fileReader.onloadend = () => {
                          if (
                            fileReader.result &&
                            typeof fileReader.result === "string"
                          ) {
                            resolve(fileReader.result);
                          } else {
                            reject(
                              new Error(
                                "Failed to convert compressed image to data URL"
                              )
                            );
                          }
                        };
                        fileReader.onerror = () => {
                          reject(new Error("Failed to read compressed image"));
                        };
                        fileReader.readAsDataURL(blob);
                      }
                    },
                    "image/jpeg",
                    currentQuality
                  );
                };

                // Start compression with initial quality
                compressWithQuality(quality);
              } catch (err) {
                reject(
                  err instanceof Error ? err : new Error("Failed to process image")
                );
              }
            };

            img.src = result;
          } catch (err) {
            reject(
              err instanceof Error ? err : new Error("Failed to set up image")
            );
          }
        };

        reader.readAsDataURL(file);
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Failed to start image compression")
        );
      }
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setAnalysis(null);

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Image is too large. Please use an image smaller than 10MB.");
        return;
      }

      try {
        // Always compress images, regardless of original size
        const compressedDataUrl = await compressImage(file);
        setImagePreview(compressedDataUrl);
        // Store the compressed data URL, not the original file
        form.setValue("image", file);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(
          `Failed to compress image: ${errorMessage}. Please try a different image.`
        );
      }
    }
  };

  const handleAnalyze = async () => {
    const imageFile = form.getValues("image");
    if (!imageFile || !imagePreview) {
      setError("Please upload an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeMealImage(imagePreview);

      if (!result.success) {
        setError(result.error);
      } else if (result.data?.analysis) {
        setAnalysis(result.data.analysis);
      } else {
        setError("Unexpected response from analysis service.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to analyse image. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: MealFormValues) => {
    if (!analysis) {
      setError("Please analyse the image first");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await logMeal({
        name: data.name,
        description: analysis.description,
        macros: analysis.estimatedMacros,
        vegetables: analysis.vegetables,
        proteins: analysis.proteins,
        carb_warning: analysis.carbWarning || undefined,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => {
          router.refresh();
          // Reset form for another entry
          setImagePreview(null);
          setAnalysis(null);
          setSaved(false);
          form.reset();
        }, 1500);
      }
    } catch (err) {
      setError("Failed to save meal. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Upload Meal Photo</h2>
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-12 transition-colors hover:border-primary"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Meal preview"
                    className="max-h-64 rounded-lg object-cover"
                  />
                ) : (
                  <>
                    <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImagePreview(null);
                    setAnalysis(null);
                    form.setValue("image", undefined);
                  }}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </div>

          {/* Analyse Button */}
          {imagePreview && !analysis && (
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full rainbow-gradient text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysing Meal...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyse with AI
                </>
              )}
            </Button>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              <div className="rounded-xl border-2 border-primary/30 bg-card p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold rainbow-text">
                  AI Analysis Results
                </h2>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Vegetables</p>
                      <p className="text-2xl font-bold">{analysis.vegetables}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Proteins</p>
                      <p className="text-2xl font-bold">{analysis.proteins}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-3 font-semibold">Estimated Macros</h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Carbs</p>
                        <p className="text-lg font-semibold">
                          {analysis.estimatedMacros.carbs}g
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Protein</p>
                        <p className="text-lg font-semibold">
                          {analysis.estimatedMacros.protein}g
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fat</p>
                        <p className="text-lg font-semibold">
                          {analysis.estimatedMacros.fat}g
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Calories</p>
                        <p className="text-lg font-semibold">
                          {analysis.estimatedMacros.calories} cal
                        </p>
                      </div>
                    </div>
                  </div>

                  {analysis.carbWarning && (
                    <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        ⚠️ Carb Warning
                      </p>
                      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        {analysis.carbWarning}
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="mt-1">{analysis.description}</p>
                  </div>
                </div>
              </div>

              {/* Meal Name Input */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meal Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Grilled Chicken Salad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSaving || saved}
                className="w-full rainbow-gradient text-white"
              >
                {saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Meal"
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
