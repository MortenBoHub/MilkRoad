import type { Products } from "@/api/Api";
import { ProductCard } from "./ProductCard";

export interface OrdersListProps {
  listings: Products[];
  /** The id currently being deleted, if any — its card shows a busy button. */
  deletingId: number | null;
  onDelete: (id: number) => void;
}

/**
 * COMPONENTS layer: renders the user's own listings as cards. Reuses
 * `ProductCard` (with its optional delete action) so the orders screen looks
 * identical to the marketplace.
 */
export function OrdersList({ listings, deletingId, onDelete }: OrdersListProps) {
  if (listings.length === 0) {
    return <p className="product-grid__empty">You have no listings yet.</p>;
  }

  return (
    <div className="product-grid">
      {listings.map((product, index) => {
        // `id` is optional in the generated type; without one we can neither
        // key the card nor offer a delete, so we skip the action.
        const id = product.id;
        return (
          <ProductCard
            key={id ?? index}
            product={product}
            deleting={id != null && id === deletingId}
            onDelete={id != null ? () => onDelete(id) : undefined}
          />
        );
      })}
    </div>
  );
}
