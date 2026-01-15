"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { ActionResult, MealAnalysisResult } from "@/lib/types/actions";
import { KETO_MAX_CARBS_PER_SERVING } from "@/lib/constants";

const mealAnalysisSchema = z.object({
  vegetables: z.number().describe("Number of different vegetables visible"),
  proteins: z.number().describe("Number of different protein sources visible"),
  estimatedMacros: z.object({
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
    calories: z.number(),
  }),
  carbWarning: z
    .string()
    .nullable()
    .describe(
      `Warning message if meal appears too carb-heavy for keto (over ${KETO_MAX_CARBS_PER_SERVING}g net carbs)`
    ),
  description: z
    .string()
    .describe("Brief description of what you see in the meal"),
});

export async function analyzeMealImage(
  imageBase64: string
): Promise<ActionResult<{ analysis: MealAnalysisResult }>> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      error: "AI service not configured. Please contact support.",
    };
  }

  if (!imageBase64) {
    return {
      success: false,
      error: "No image provided.",
    };
  }

  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Prepare image - extract base64 if it's a data URL
    let imageData: string;
    if (imageBase64.startsWith("data:")) {
      const base64Match = imageBase64.match(/^data:image\/[a-z]+;base64,(.+)$/);
      if (base64Match) {
        imageData = base64Match[1];
      } else {
        const commaIndex = imageBase64.indexOf(",");
        imageData =
          commaIndex !== -1 ? imageBase64.substring(commaIndex + 1) : imageBase64;
      }
    } else {
      imageData = imageBase64;
    }

    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "image" as const,
            image: `data:image/jpeg;base64,${imageData}`,
          },
          {
            type: "text" as const,
            text: `Analyze this meal image. Count the number of vegetables and proteins, estimate macros (carbs, protein, fat, calories), and provide a keto assessment. If the meal appears to have more than ${KETO_MAX_CARBS_PER_SERVING}g net carbs, include a carb warning.`,
          },
        ],
      },
    ];

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: mealAnalysisSchema,
      messages,
    });

    return {
      success: true,
      data: { analysis: object as MealAnalysisResult },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to analyze meal image. Please try again.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
