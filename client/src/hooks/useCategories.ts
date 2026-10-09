import { useEffect } from "react";
import { api } from "@/api/client";
import { describeError } from "@/api/errors";
import { useCategoriesState } from "@/atoms/categoriesAtom";
import { toMarketCategory } from "@/categories";

/**
 * HOOKS layer: fetch the marketplace categories from the server.
 *
 * Mirrors useProducts (mount fetch, abortable, StrictMode-safe) and projects the
 * API's Category onto the UI's MarketCategory.
 */
export function useCategories() {
  const { categories, setCategories, status, setStatus, error, setError } =
    useCategoriesState();

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    setError(null);

    api.api
      .categoryGetAll({ signal: controller.signal })
      .then((data) => {
        // A category with no slug can't match any product, so drop it.
        setCategories(
          data
            .map(toMarketCategory)
            .filter((category) => category.id !== ""),
        );
        setStatus("success");
      })
      .catch(async (err: unknown) => {
        // StrictMode's first mount aborts its own request; that isn't a failure.
        if (controller.signal.aborted) return;

        const message = await describeError(err);
        if (controller.signal.aborted) return;

        setError(message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [setCategories, setStatus, setError]);

  return { categories, status, error };
}
