import { useState } from "react";

/**
 * ATOMS layer: state for the orders screen. `deletingId` marks the one row
 * mid-delete so its button can show "Deleting…" without freezing the list.
 */
export function useOrdersState() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return { deletingId, setDeletingId, deleteError, setDeleteError };
}
