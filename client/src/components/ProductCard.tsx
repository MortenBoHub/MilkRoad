import type { Products } from "@/api/Api";

/**
 * Decorative "bazaar" metadata. The API gives only id/name/price/isForSale, so
 * these are invented for the parody. They MUST be a pure function of the product
 * id — never Math.random() — or every re-render would reshuffle the cards and
 * the listing would flicker.
 */

const VENDORS = [
  "DairyKing_7",
  "GrassFedGoods",
  "TheCurdLords",
  "UdderlyLegit",
  "PasturePrime",
  "CreamOfTheCrop",
  "ButterBarn",
  "LactoseLarry",
  "WheyToGo",
  "MooDengFarm",
];

const SHIPS_FROM = [
  "Jutland",
  "Alpine Valley",
  "Normandy",
  "Friesland",
  "Devon",
  "Hokkaido",
  "The Lowlands",
  "Wisconsin",
];

/**
 * FNV-1a — a tiny, stable string hash. Deterministic across renders and
 * machines, which `Math.random()` is not.
 */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

interface Decoration {
  vendor: string;
  shipsFrom: string;
  rating: number;
  reviews: number;
}

/**
 * Index into a non-empty list without tripping `noUncheckedIndexedAccess`.
 * The fallback is unreachable in practice but keeps the return type `T`.
 */
function pick<T>(list: readonly T[], index: number, fallback: T): T {
  return list[index % list.length] ?? fallback;
}

/** Derive stable fake metadata from the product's identity. */
function decorate(seed: string): Decoration {
  const hash = hashString(seed);
  return {
    vendor: pick(VENDORS, hash, "unknown vendor"),
    shipsFrom: pick(SHIPS_FROM, hash >>> 8, "parts unknown"),
    // 3.0 – 5.0 in tenths, so the bazaar looks well-reviewed but not perfect.
    rating: 3 + ((hash >>> 12) % 21) / 10,
    reviews: 12 + ((hash >>> 5) % 4888),
  };
}

function formatPrice(price: number): string {
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Stars: filled for the rounded rating, hollow for the rest. */
function starsFor(rating: number): string {
  const filled = Math.round(rating);
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

/** Original milk-carton glyph — our own artwork, not the real SR logo. */
function MilkGlyph() {
  return (
    <svg
      className="product-card__glyph"
      viewBox="0 0 48 64"
      role="img"
      aria-label="Milk carton"
    >
      <path
        d="M10 20 L24 9 L38 20 L38 58 L10 58 Z"
        fill="#0d130c"
        stroke="#3f6b3f"
        strokeWidth="1.5"
      />
      <path d="M10 20 L24 9 L38 20" fill="none" stroke="#6fbf6f" strokeWidth="1.5" />
      <path d="M24 9 L24 20" stroke="#3f6b3f" strokeWidth="1.5" />
      <rect x="15" y="30" width="18" height="15" fill="#10160f" stroke="#3f6b3f" />
      <text
        x="24"
        y="41"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Georgia, serif"
        fill="#9be89b"
      >
        M
      </text>
    </svg>
  );
}

export interface ProductCardProps {
  product: Products;
  /** When provided, the card shows a delete action (used by the orders view). */
  onDelete?: () => void;
  /** When provided, the card shows a buy action (marketplace, for-sale items). */
  onBuy?: () => void;
  /** A card-level busy flag: used by whichever action is present. */
  buying?: boolean;
  deleting?: boolean;
}

/**
 * COMPONENTS layer: props in, JSX out.
 *
 * Every field on `Products` is optional in the generated type, so `productName`
 * and `price` can legitimately be undefined — the UI must never crash on that.
 */
export function ProductCard({
  product,
  onDelete,
  onBuy,
  buying = false,
  deleting = false,
}: ProductCardProps) {
  const name = product.productName ?? "Untitled product";
  const price = product.price ?? 0;
  const forSale = product.isForSale === true;

  // Identity for the decorative hash. Prefer the real id; fall back to the name.
  const seed = product.id != null ? String(product.id) : name;
  const { vendor, shipsFrom, rating, reviews } = decorate(seed);

  return (
    <article className="product-card">
      <div className="product-card__thumb">
        <MilkGlyph />
      </div>

      <h3 className="product-card__name" title={name}>
        {name}
      </h3>

      <p className="product-card__vendor">
        by <span className="product-card__handle">{vendor}</span>
      </p>

      <p className="product-card__rating">
        <span className="product-card__stars" aria-hidden="true">
          {starsFor(rating)}
        </span>
        <span className="product-card__score">{rating.toFixed(1)}</span>
        <span className="product-card__reviews">({reviews})</span>
      </p>

      <p className="product-card__ships">ships from {shipsFrom}</p>

      <div className="product-card__footer">
        <span className="product-card__price">
          {formatPrice(price)} <span className="product-card__unit">MOO</span>
        </span>
        <span
          className={
            forSale ? "badge badge--for-sale" : "badge badge--not-for-sale"
          }
        >
          {forSale ? "For sale" : "Not for sale"}
        </span>
      </div>

      {onBuy ? (
        <button
          type="button"
          className="product-card__buy"
          onClick={onBuy}
          disabled={buying}
        >
          {buying ? "Buying…" : "Buy now"}
        </button>
      ) : null}

      {onDelete ? (
        <button
          type="button"
          className="product-card__delete"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      ) : null}
    </article>
  );
}
