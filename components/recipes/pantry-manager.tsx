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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPantry();
  }, []);

  const loadPantry = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getPantry();
    if (result.success && result.data) {
      setPantryItems(result.data.ingredients);
    } else if (!result.success) {
      setError("error" in result ? result.error : "Failed to load pantry items");
    }
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!newItem.trim()) return;

    setIsAdding(true);
    setError(null);
    setSuccess(null);
    const itemName = newItem.trim();
    const result = await addPantryItem(itemName);
    if (result.success) {
      setNewItem("");
      setSuccess(`${itemName} added to pantry!`);
      await loadPantry();
      router.refresh(); // Refresh to update recipe generator
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || "Failed to add item");
    }
    setIsAdding(false);
  };

  const handleRemove = async (ingredient: string) => {
    setError(null);
    setSuccess(null);
    const result = await removePantryItem(ingredient);
    if (result.success) {
      setSuccess(`${ingredient} removed from pantry`);
      await loadPantry();
      router.refresh(); // Refresh to update recipe generator
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || "Failed to remove item");
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Pantry (Ambient Ingredients)</h3>
          <p className="text-sm text-muted-foreground">
            Manage your pantry items that you always have on hand
          </p>
        </div>
        {pantryItems.length > 0 && (
          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {pantryItems.length} item{pantryItems.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}

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
