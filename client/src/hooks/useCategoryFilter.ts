import type { Products } from "@/api/Api";
import { useCategoryState } from "@/atoms/categoryAtom";
import { DEFAULT_CATEGORY_ID } from "@/categories";

/**
 * Pure half of the filter, exported for reasoning/testing without React. A
 * product belongs to a category when its slug matches; products from before the
 * Category column existed have no slug, so they fall back to the default.
 */
export function productsInCategory(
  products: Products[],
  categoryId: string,
): Products[] {
  return products.filter(
    (product) => (product.category ?? DEFAULT_CATEGORY_ID) === categoryId,
  );
}

/**
 * HOOKS layer: owns the selected category and derives the visible products.
 */
export function useCategoryFilter(products: Products[]) {
  const { categoryId, setCategoryId } = useCategoryState();

  return {
    categoryId,
    setCategoryId,
    visibleProducts: productsInCategory(products, categoryId),
  };
}
