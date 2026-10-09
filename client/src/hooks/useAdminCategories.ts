import { useEffect } from "react";
import type { Category } from "@/api/Api";
import { api } from "@/api/client";
import { describeError } from "@/api/errors";
import {
  useAdminCategoriesState,
  type CategoryDraft,
  type CategoryEdit,
} from "@/atoms/adminCategoriesAtom";
import { slugify } from "@/categories";

/**
 * HOOKS layer: admin category management.
 *
 * Owns the list, the add/edit form state, and the create/rename/toggle/delete
 * actions. Every successful mutation reloads the list, so the table always
 * mirrors the server.
 */
export function useAdminCategories() {
  const {
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
  } = useAdminCategoriesState();

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    setError(null);

    api.api
      .adminGetAllCategories({ signal: controller.signal })
      .then((data) => {
        setCategories(data);
        setStatus("success");
      })
      .catch(async (err: unknown) => {
        if (controller.signal.aborted) return;

        const message = await describeError(err);
        if (controller.signal.aborted) return;

        setError(message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [setCategories, setStatus, setError]);

  /** Re-fetch after a mutation; the table is never patched by hand. */
  async function refresh() {
    setCategories(await api.api.adminGetAllCategories());
  }

  function changeDraft(patch: Partial<CategoryDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setActionError(null);
  }

  /** Create the drafted category. The slug is derived from the name if blank. */
  async function submitDraft(): Promise<boolean> {
    const name = draft.name.trim();
    const slug = (draft.slug.trim() || slugify(name)).toLowerCase();

    if (!name) {
      setActionError("A category name is required.");
      return false;
    }
    if (!slug) {
      setActionError("A slug is required (letters, numbers and dashes).");
      return false;
    }

    setBusy(true);
    setActionError(null);

    try {
      await api.api.adminCreateCategory({
        name,
        slug,
        isAvailable: draft.available,
      });
      await refresh();
      setDraft({ name: "", slug: "", available: true });
      return true;
    } catch (err) {
      setActionError(await describeError(err));
      return false;
    } finally {
      setBusy(false);
    }
  }

  function startEdit(category: Category) {
    if (typeof category.id !== "number") return;

    setEditing({
      id: category.id,
      slug: category.slug ?? "",
      name: category.name ?? "",
      available: category.isAvailable === true,
    });
    setActionError(null);
  }

  function changeEdit(patch: Partial<CategoryEdit>) {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
    setActionError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setActionError(null);
  }

  /** Save the inline edit. The slug is immutable, so it is sent back unchanged. */
  async function submitEdit(): Promise<boolean> {
    if (!editing) return false;

    const name = editing.name.trim();
    if (!name) {
      setActionError("A category name is required.");
      return false;
    }

    setBusy(true);
    setActionError(null);

    try {
      await api.api.adminUpdateCategory(
        { id: editing.id },
        { name, slug: editing.slug, isAvailable: editing.available },
      );
      await refresh();
      setEditing(null);
      return true;
    } catch (err) {
      setActionError(await describeError(err));
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** Delete a category. Refused by the server (409) when it is still in use. */
  async function remove(category: Category): Promise<boolean> {
    if (typeof category.id !== "number") return false;

    setBusy(true);
    setActionError(null);

    try {
      await api.api.adminDeleteCategory({ id: category.id });
      await refresh();
      return true;
    } catch (err) {
      setActionError(await describeError(err));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    categories,
    status,
    error,
    actionError,
    busy,
    draft,
    editing,
    changeDraft,
    submitDraft,
    startEdit,
    changeEdit,
    cancelEdit,
    submitEdit,
    remove,
  };
}
