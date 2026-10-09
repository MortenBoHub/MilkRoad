import { useState } from "react";

/** Where a create-listing submission is in its lifecycle. */
export type ListingStatus = "idle" | "submitting" | "success" | "error";

/** Per-field validation messages, keyed by field name. */
export interface ListingFieldErrors {
  productName?: string;
  price?: string;
  category?: string;
}

/**
 * ATOMS layer: create-listing form state. Validation and the POST live in
 * hooks/useCreateListing.ts. `price` stays the raw input string — parsing is logic.
 */
export function useListingFormState(initialCategoryId: string) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [fieldErrors, setFieldErrors] = useState<ListingFieldErrors>({});
  const [status, setStatus] = useState<ListingStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  return {
    productName,
    setProductName,
    price,
    setPrice,
    categoryId,
    setCategoryId,
    fieldErrors,
    setFieldErrors,
    status,
    setStatus,
    error,
    setError,
  };
}
