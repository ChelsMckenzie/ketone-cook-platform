import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ketomate.co.za";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic pages - public recipes
  try {
    const supabase = await createClient();
    const { data: recipes } = await supabase
      .from("recipes")
      .select("id, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(100);

    type RecipeSitemap = {
      id: string;
      created_at: string;
    };

    const recipePages: MetadataRoute.Sitemap =
      (recipes as RecipeSitemap[] | null)?.map((recipe) => ({
        url: `${baseUrl}/recipes/${recipe.id}`,
        lastModified: new Date(recipe.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })) || [];

    return [...staticPages, ...recipePages];
  } catch (error) {
    // Return just static pages if database is unavailable
    return staticPages;
  }
}
