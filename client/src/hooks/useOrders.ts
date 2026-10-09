import { api } from "@/api/client";
import type { Products } from "@/api/Api";
import { describeError } from "@/api/errors";
import { useOrdersState } from "@/atoms/ordersAtom";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";

/**
 * Pure part, exported for reasoning/testing without React: a user owns the
 * products whose `userId` matches theirs.
 */
export function ownedByUser(products: Products[], userId: number): Products[] {
  return products.filter((product) => product.userId === userId);
}

/**
 * HOOKS layer: the signed-in user's own listings, plus deleting them.
 *
 * No "get my products" endpoint exists, so we reuse the marketplace fetch and
 * filter to the current user. Fine at this scale; a dedicated endpoint would be
 * the next step if the catalogue grew.
 */
export function useOrders() {
  const { user } = useAuth();
  const { products, status, error, removeProduct } = useProducts();
  const { deletingId, setDeletingId, deleteError, setDeleteError } =
    useOrdersState();

  const listings = user ? ownedByUser(products, user.userId) : [];

  /** Delete a listing, then drop it from the local list. Resolves true on success. */
  async function deleteListing(id: number): Promise<boolean> {
    if (!user) {
      setDeleteError("You must be signed in to delete a listing.");
      return false;
    }

    setDeletingId(id);
    setDeleteError(null);

    try {
      await api.api.baseUserDeleteProduct({ userId: user.userId, productId: id });
      removeProduct(id);
      return true;
    } catch (err) {
      setDeleteError(await describeError(err));
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return { listings, status, error, deletingId, deleteError, deleteListing };
}
