"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import type { ActionResult, GeneratedRecipe } from "@/lib/types/actions";
import { KETO_MAX_CARBS_PER_SERVING } from "@/lib/constants";

export async function generateRecipe(
  ingredients: string[]
): Promise<ActionResult<{ recipe: GeneratedRecipe }>> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return {
      success: false,
      error: "AI service not configured. Please contact support.",
    };
  }

  if (!ingredients || ingredients.length === 0) {
    return {
      success: false,
      error: "Please provide at least one ingredient.",
    };
  }

  const prompt = `You are a Keto diet expert. Create a delicious, keto-friendly recipe using ONLY these ingredients: ${ingredients.join(", ")}.

Requirements:
- Recipe must be strictly keto (under ${KETO_MAX_CARBS_PER_SERVING}g net carbs per serving)
- Use only the provided ingredients (you can suggest common keto staples like salt, pepper, olive oil if needed)
- Provide exact measurements
- Include step-by-step cooking instructions
- Calculate and provide macros per serving (carbs, protein, fat, calories)
- Make it creative and delicious

Format your response as JSON with this structure:
{
  "title": "Recipe name",
  "ingredients": [{"name": "ingredient", "amount": "quantity"}],
  "instructions": "step-by-step instructions",
  "macros": {
    "carbs": number,
    "protein": number,
    "fat": number,
    "calories": number
  },
  "cooking_time": number (in minutes),
  "difficulty": "easy" | "medium" | "hard",
  "category": "breakfast" | "lunch" | "dinner" | "snack" | "dessert"
}`;

  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      temperature: 0.7,
    });

    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim();

    if (jsonText.startsWith("```")) {
      const firstNewline = jsonText.indexOf("\n");
      if (firstNewline !== -1) {
        jsonText = jsonText.substring(firstNewline + 1);
      }
      const lastBackticks = jsonText.lastIndexOf("```");
      if (lastBackticks !== -1) {
        jsonText = jsonText.substring(0, lastBackticks);
      }
      jsonText = jsonText.trim();
    }

    const recipe = JSON.parse(jsonText) as GeneratedRecipe;

    return {
      success: true,
      data: { recipe },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate recipe";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
