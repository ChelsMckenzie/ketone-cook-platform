"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sparkles,
  Plus,
  X,
  Save,
  Loader2,
  RefreshCw,
  History,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { generateRecipe } from "@/lib/ai/recipe-generator";
import { createRecipe } from "@/lib/actions/recipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { GeneratedRecipe } from "@/lib/types/actions";
import { getPantry } from "@/lib/actions/pantry";
import { PantryManager } from "./pantry-manager";

const MAX_REGENERATIONS = 5;

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string(),
    })
  ),
  instructions: z.string().min(1, "Instructions are required"),
  macros: z.object({
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
    calories: z.number(),
  }),
  cooking_time: z.number().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum(["breakfast", "lunch", "dinner", "snack", "dessert"]),
  is_public: z.boolean(),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

export function RecipeGenerator() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [includePantryItems, setIncludePantryItems] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Recipe history state
  const [recipeHistory, setRecipeHistory] = useState<GeneratedRecipe[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Load pantry items on mount and when component refreshes
  useEffect(() => {
    loadPantry();
  }, []);

  const loadPantry = async () => {
    const result = await getPantry();
    if (result.success && result.data) {
      setPantryItems(result.data.ingredients);
    }
  };

  // Reload pantry when router refreshes (after pantry changes)
  useEffect(() => {
    const handleFocus = () => {
      loadPantry();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      ingredients: [],
      instructions: "",
      macros: { carbs: 0, protein: 0, fat: 0, calories: 0 },
      cooking_time: 30,
      difficulty: "medium",
      category: "dinner",
      is_public: false,
    },
  });

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const populateFormWithRecipe = (recipe: GeneratedRecipe) => {
    setGeneratedRecipe(recipe);
    form.setValue("title", recipe.title);
    form.setValue("ingredients", recipe.ingredients);
    form.setValue("instructions", recipe.instructions);
    form.setValue("macros", recipe.macros);
    form.setValue("cooking_time", recipe.cooking_time);
    form.setValue("difficulty", recipe.difficulty);
    form.setValue("category", recipe.category);
  };

  const handleGenerate = async (isRegeneration: boolean = false) => {
    if (ingredients.length === 0 && (!includePantryItems || pantryItems.length === 0)) {
      setError("Please add at least one fresh ingredient or set up your pantry");
      return;
    }

    if (isRegeneration && regenerationCount >= MAX_REGENERATIONS) {
      setError(
        `Maximum regenerations (${MAX_REGENERATIONS}) reached. Please choose from previous options or start over.`
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Combine pantry items with fresh ingredients (only if toggle is ON)
    const allIngredients = includePantryItems
      ? [...pantryItems, ...ingredients]
      : ingredients;

    try {
      const result = await generateRecipe(allIngredients);
      if (!result.success) {
        setError(result.error);
      } else if (result.data?.recipe) {
        const recipe = result.data.recipe;

        // Add to history
        const newHistory = [...recipeHistory, recipe];
        setRecipeHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);

        if (isRegeneration) {
          setRegenerationCount((prev) => prev + 1);
        }

        populateFormWithRecipe(recipe);
      }
    } catch (err) {
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectFromHistory = (index: number) => {
    if (index >= 0 && index < recipeHistory.length) {
      setCurrentHistoryIndex(index);
      populateFormWithRecipe(recipeHistory[index]);
      setShowHistory(false);
    }
  };

  const navigateHistory = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev" ? currentHistoryIndex - 1 : currentHistoryIndex + 1;
    if (newIndex >= 0 && newIndex < recipeHistory.length) {
      selectFromHistory(newIndex);
    }
  };

  const onSubmit = async (data: RecipeFormValues) => {
    setIsSaving(true);
    setError(null);

    try {
      if (!data.title || !data.ingredients || !data.instructions) {
        setError("Please fill in all required fields.");
        setIsSaving(false);
        return;
      }

      const result = await createRecipe({
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        macros: data.macros,
        cooking_time: data.cooking_time,
        difficulty: data.difficulty,
        category: data.category,
        is_public: data.is_public,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const remainingRegenerations = MAX_REGENERATIONS - regenerationCount;

  return (
    <div className="space-y-6">
      {/* Pantry Manager Section */}
      <PantryManager />

      {/* Pantry Toggle Switch */}
      {pantryItems.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border-2 border-border bg-card p-4 shadow-sm">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Include Pantry Items</p>
            <p className="text-xs text-muted-foreground">
              Automatically include your {pantryItems.length} pantry item{pantryItems.length !== 1 ? "s" : ""} when generating recipes
            </p>
          </div>
          <Switch
            checked={includePantryItems}
            onCheckedChange={setIncludePantryItems}
          />
        </div>
      )}

      {/* Fresh Ingredients Input Section */}
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">Fresh Ingredients</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Add fresh ingredients you have available today.
          {pantryItems.length > 0 && includePantryItems && " Your pantry items will be automatically included."}
        </p>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter fresh ingredient (e.g., chicken, broccoli, fresh herbs)"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addIngredient();
                }
              }}
            />
            <Button type="button" onClick={addIngredient}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-sm"
                >
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {pantryItems.length > 0 && (
            <div className={`mt-4 rounded-lg border p-3 ${
              includePantryItems
                ? "border-border bg-muted/30"
                : "border-muted bg-muted/10 opacity-60"
            }`}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Pantry items {includePantryItems ? "(will be included)" : "(excluded)"}:
              </p>
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating || (ingredients.length === 0 && (!includePantryItems || pantryItems.length === 0))}
            className="w-full rainbow-gradient text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Keto Recipe
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Generated Recipe Form */}
      {generatedRecipe && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-xl border-2 border-primary/30 bg-card p-6 shadow-lg">
              {/* Header with history navigation */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold rainbow-text">
                  Review & Save Recipe
                </h2>
                {recipeHistory.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Recipe {currentHistoryIndex + 1} of {recipeHistory.length}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentHistoryIndex === 0}
                        onClick={() => navigateHistory("prev")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentHistoryIndex === recipeHistory.length - 1}
                        onClick={() => navigateHistory("next")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cooking_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cooking Time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h3 className="mb-2 font-semibold">Ingredients</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    {form.watch("ingredients").map((ing, idx) => (
                      <li key={idx}>
                        {ing.amount} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={8} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h3 className="mb-2 font-semibold">Macros (per serving)</h3>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Carbs</p>
                      <p className="font-semibold">
                        {form.watch("macros.carbs")}g
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Protein</p>
                      <p className="font-semibold">
                        {form.watch("macros.protein")}g
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fat</p>
                      <p className="font-semibold">
                        {form.watch("macros.fat")}g
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Calories</p>
                      <p className="font-semibold">
                        {form.watch("macros.calories")} cal
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Make Public</FormLabel>
                        <FormDescription>
                          Share this recipe with the community
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Regenerate Section */}
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Not happy with this recipe?
                      </span>
                    </div>
                    <span
                      className={`text-sm ${remainingRegenerations <= 2 ? "text-amber-600" : "text-muted-foreground"}`}
                    >
                      {remainingRegenerations} regeneration
                      {remainingRegenerations !== 1 ? "s" : ""} remaining
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleGenerate(true)}
                      disabled={
                        isGenerating || remainingRegenerations === 0
                      }
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Generate New Recipe
                        </>
                      )}
                    </Button>

                    {recipeHistory.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        View History ({recipeHistory.length})
                      </Button>
                    )}
                  </div>

                  {remainingRegenerations === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      You&apos;ve used all regenerations. Choose from your
                      previous options above or save your current selection.
                    </p>
                  )}
                </div>

                {/* Recipe History Panel */}
                {showHistory && recipeHistory.length > 1 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <History className="h-4 w-4" />
                      Generated Recipes History
                    </h3>
                    <div className="space-y-2">
                      {recipeHistory.map((recipe, index) => (
                        <div
                          key={index}
                          onClick={() => selectFromHistory(index)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:border-primary/50 ${
                            currentHistoryIndex === index
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{recipe.title}</span>
                              {currentHistoryIndex === index && (
                                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                              <span>{recipe.macros.carbs}g carbs</span>
                              <span>{recipe.macros.protein}g protein</span>
                              <span>{recipe.cooking_time} min</span>
                              <span className="capitalize">{recipe.difficulty}</span>
                            </div>
                          </div>
                          {currentHistoryIndex === index && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 rainbow-gradient text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Recipe
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setGeneratedRecipe(null);
                      setRecipeHistory([]);
                      setCurrentHistoryIndex(-1);
                      setRegenerationCount(0);
                      setShowHistory(false);
                      form.reset();
                      setIngredients([]);
                    }}
                  >
                    Start Over
                  </Button>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
