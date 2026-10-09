import { Link } from "react-router";

/**
 * COMPONENTS layer: the "return to the marketplace" link shared by the
 * sub-pages (login, sell, orders, admin) so they all read the same way.
 */
export function BackToProducts() {
  return (
    <Link className="back-link" to="/">
      ← Back to products
    </Link>
  );
}
