import { useState } from "react";
import type { LoadState } from "@/atoms/productsAtom";
import type { MarketCategory } from "@/categories";

/**
 * ATOMS layer: server-provided category list. Same lifecycle as products; the
 * logic lives in hooks/useCategories.ts.
 */
export function useCategoriesState() {
  const [categories, setCategories] = useState<MarketCategory[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  return { categories, setCategories, status, setStatus, error, setError };
}
