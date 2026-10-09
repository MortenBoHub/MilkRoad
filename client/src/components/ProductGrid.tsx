import type { Products } from "@/api/Api";
import { ProductCard } from "./ProductCard";

export interface ProductGridProps {
  products: Products[];
  /**
   * Enables buying. Only for-sale products the viewer doesn't own get a Buy
   * button, so a signed-out visitor simply passes nothing here.
   */
  buy?: {
    currentUserId: number;
    buyingId: number | null;
    onBuy: (id: number) => void;
  };
}

/**
 * COMPONENTS layer: takes a list, renders a list. No fetching, no state.
 *
 * The empty case lives here, not in StatusMessage: "succeeded and returned
 * nothing" is a property of the grid's contents, not a request status.
 */
export function ProductGrid({ products, buy }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="product-grid__empty">No products yet.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => {
        // `id` is optional in the generated type even though the API always
        // sends one. The index is only a last-resort fallback for the key.
        const id = product.id;

        let onBuy: (() => void) | undefined;
        let buying = false;
        if (
          buy &&
          id != null &&
          product.isForSale === true &&
          product.userId !== buy.currentUserId
        ) {
          onBuy = () => buy.onBuy(id);
          buying = id === buy.buyingId;
        }

        return (
          <ProductCard
            key={id ?? index}
            product={product}
            onBuy={onBuy}
            buying={buying}
          />
        );
      })}
    </div>
  );
}
