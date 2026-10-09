import { useState } from "react";
import type { Products } from "@/api/Api";

/**
 * Product list lifecycle. One union rather than two booleans (isLoading +
 * isError), which can contradict each other; "idle" is before the first fetch.
 */
export type LoadState = "idle" | "loading" | "success" | "error";

/**
 * ATOMS layer: state only — no fetching, no JSX, no rules. The logic lives in
 * hooks/useProducts.ts. State is stored exactly as the API returns it, because
 * normalising it is a transformation, which belongs in the hook.
 */
export function useProductsState() {
  const [products, setProducts] = useState<Products[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  return { products, setProducts, status, setStatus, error, setError };
}
