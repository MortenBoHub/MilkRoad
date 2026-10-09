import { useState } from "react";
import type { Category } from "@/api/Api";
import type { LoadState } from "@/atoms/productsAtom";

/** The "add category" form's fields. */
export interface CategoryDraft {
  name: string;
  slug: string;
  available: boolean;
}

/** The row currently being edited inline. */
export interface CategoryEdit {
  id: number;
  slug: string;
  name: string;
  available: boolean;
}

/**
 * ATOMS layer: state for the admin category manager, kept out of the component
 * so it stays presentational. `categories` holds the raw API `Category` (with
 * numeric id) because the write endpoints address by id.
 */
export function useAdminCategoriesState() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<CategoryDraft>({
    name: "",
    slug: "",
    available: true,
  });
  const [editing, setEditing] = useState<CategoryEdit | null>(null);

  return {
    categories,
    setCategories,
    status,
    setStatus,
    error,
    setError,
    actionError,
    setActionError,
    busy,
    setBusy,
    draft,
    setDraft,
    editing,
    setEditing,
  };
}
