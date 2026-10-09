import { useState } from "react";
import { DEFAULT_CATEGORY_ID } from "@/categories";

/**
 * ATOMS layer: which category the grid is filtered to. UI state only; the
 * filtering itself lives in hooks/useCategoryFilter.
 */
export function useCategoryState(
  initialCategoryId: string = DEFAULT_CATEGORY_ID,
) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  return { categoryId, setCategoryId };
}
