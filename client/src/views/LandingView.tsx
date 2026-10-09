import { Link } from "react-router";
import { CategorySidebar } from "@/components/CategorySidebar";
import { FbiRaidScreen } from "@/components/FbiRaidScreen";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { StatusMessage } from "@/components/StatusMessage";
import { findCategory } from "@/categories";
import { useAuth } from "@/hooks/useAuth";
import { useBuy } from "@/hooks/useBuy";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { useProducts } from "@/hooks/useProducts";

/**
 * VIEWS layer: the only place that assembles atoms + hooks + components.
 *
 * A view reads the hooks and decides what to render — no fetching of its own
 * (the hooks do that) and no reusable markup (the components do that).
 */
export function LandingView() {
  const { products, status, error, reload } = useProducts();
  const { categories, status: categoriesStatus } = useCategories();
  const { user } = useAuth();
  const {
    buy,
    buyingId,
    error: buyError,
    raid,
    dismissRaid,
  } = useBuy(reload);
  const { categoryId, setCategoryId, visibleProducts } =
    useCategoryFilter(products);

  // The heading doubles as confirmation of which category is shown; its label
  // comes from the server-owned list.
  const heading = findCategory(categories, categoryId)?.label ?? "Products";

  return (
    <div className="page">
      <Header />
      <div className="page__body">
        <CategorySidebar
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          loading={categoriesStatus === "loading"}
        />
        <main className="page__main">
          <div className="page__head">
            <h1 className="page__title">{heading}</h1>
            {/* Selling needs an account, so the CTA only shows when signed in. */}
            {user ? (
              <Link className="page__cta" to="/sell">
                + List an item
              </Link>
            ) : null}
          </div>

          {buyError ? (
            <p className="form__error" role="alert">
              {buyError}
            </p>
          ) : null}

          {status === "success" ? (
            <ProductGrid
              products={visibleProducts}
              /* Buying needs an account: no buy buttons when signed out. */
              buy={
                user
                  ? {
                      currentUserId: user.userId,
                      buyingId,
                      onBuy: buy,
                    }
                  : undefined
              }
            />
          ) : (
            <StatusMessage status={status} error={error} />
          )}
        </main>
      </div>

      {raid ? <FbiRaidScreen result={raid} onDismiss={dismissRaid} /> : null}
    </div>
  );
}
