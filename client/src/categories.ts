import type { Category } from "@/api/Api";

/**
 * The view-model the marketplace components use. The server owns the category
 * list now; this file just projects the API's `Category` onto it.
 *
 * Named `MarketCategory` so it can't collide with the generated `Category`.
 */
export interface MarketCategory {
  /** Server slug; also what a product stores in `category`. */
  id: string;
  /** Server display label. */
  label: string;
  /** "Soon" categories show in the sidebar but can't be chosen for a listing. */
  available: boolean;
}

/** Fallback when the server has no categories yet (matches Products.DefaultCategory). */
export const DEFAULT_CATEGORY_ID = "milk";

/** Project the API's `Category` onto `MarketCategory` (slug→id, name→label). */
export function toMarketCategory(category: Category): MarketCategory {
  const id = category.slug ?? "";
  return {
    id,
    label: category.name ?? id,
    available: category.isAvailable === true,
  };
}

/** Only these can be chosen when creating a listing. */
export function availableCategories(
  categories: MarketCategory[],
): MarketCategory[] {
  return categories.filter((category) => category.available);
}

export function findCategory(
  categories: MarketCategory[],
  id: string,
): MarketCategory | undefined {
  return categories.find((category) => category.id === id);
}

/** "Ice Cream" -> "ice-cream". Used to suggest a slug in the admin form. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
