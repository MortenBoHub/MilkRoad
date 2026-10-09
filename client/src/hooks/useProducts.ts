import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { describeError } from "@/api/errors";
import { useProductsState } from "@/atoms/productsAtom";

/**
 * HOOKS layer: getting products — when to fetch, status transitions, cancel.
 * No JSX; rendering belongs to the components layer.
 */
export function useProducts() {
  const { products, setProducts, status, setStatus, error, setError } =
    useProductsState();

  // Bumping this token re-runs the fetch effect below. It is how a caller asks
  // for fresh data (e.g. after a purchase) without a full page reload.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    setError(null);

    api.api
      .productGetAll({ signal: controller.signal })
      .then((data) => {
        setProducts(data);
        setStatus("success");
      })
      .catch(async (err: unknown) => {
        // React StrictMode mounts, unmounts and remounts in dev, so the first
        // effect's request is aborted by its own cleanup. That is not a
        // failure the user should ever see.
        if (controller.signal.aborted) return;

        const message = await describeError(err);
        // Reading the error body is async, so re-check before setting state.
        if (controller.signal.aborted) return;

        setError(message);
        setStatus("error");
      });

    // Cleanup runs on unmount AND before the effect runs again: without it a
    // slow response could resolve after unmount, or overwrite a newer one.
    return () => controller.abort();

    // The setters from useState are stable; reloadToken is the only input, so
    // this runs on mount and whenever a reload is requested.
  }, [reloadToken, setProducts, setStatus, setError]);

  /** Re-fetch the catalogue (e.g. after a purchase changed it). */
  function reload() {
    setReloadToken((token) => token + 1);
  }

  /**
   * Drop one product from the local list after a successful delete, so the UI
   * updates without a refetch. Views that don't delete simply ignore this.
   */
  function removeProduct(id: number) {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  return { products, status, error, removeProduct, reload };
}
