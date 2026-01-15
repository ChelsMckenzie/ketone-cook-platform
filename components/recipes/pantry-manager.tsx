"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPantry, addPantryItem, removePantryItem } from "@/lib/actions/pantry";

export function PantryManager() {
  const router = useRouter();
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadPantry();
  }, []);

  const loadPantry = async () => {
    setIsLoading(true);
    const result = await getPantry();
    if (result.success && result.data) {
      setPantryItems(result.data.ingredients);
    }
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;

    setIsAdding(true);
    const result = await addPantryItem(newItem.trim());
    if (result.success) {
      setNewItem("");
      await loadPantry();
      router.refresh(); // Refresh to update recipe generator
    }
    setIsAdding(false);
  };

  const handleRemove = async (ingredient: string) => {
    const result = await removePantryItem(ingredient);
    if (result.success) {
      await loadPantry();
      router.refresh(); // Refresh to update recipe generator
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">My Pantry (Ambient Ingredients)</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Manage your pantry items that you always have on hand. These will be included when generating recipes.
      </p>

      {/* Add new item */}
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Add ingredient (e.g., olive oil, salt, pepper)"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAdd();
            }
          }}
        />
        <Button
          onClick={handleAdd}
          disabled={isAdding || !newItem.trim()}
          size="icon"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Pantry items list */}
      {pantryItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {pantryItems.map((item) => (
            <div
              key={item}
              className="group flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm transition-all hover:bg-muted"
            >
              <span>{item}</span>
              <button
                onClick={() => handleRemove(item)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No pantry items yet. Add ingredients you always have on hand.
        </p>
      )}
    </div>
  );
}
