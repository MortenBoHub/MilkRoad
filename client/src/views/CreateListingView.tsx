import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BackToProducts } from "@/components/BackToProducts";
import { ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useCreateListing } from "@/hooks/useCreateListing";

/**
 * VIEWS layer: assembles the create-listing hook with the listing form.
 *
 * Route guard: selling needs an identity, so an anonymous visitor is bounced to
 * /login. On success we return to the marketplace, whose grid refetches on mount
 * and so shows the new listing.
 */
export function CreateListingView() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const form = useCreateListing(categories);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (form.status === "success") navigate("/", { replace: true });
  }, [form.status, navigate]);

  if (!user) return null;

  return (
    <div className="page">
      <main className="narrow">
        <h1 className="narrow__title">New listing</h1>
        <p className="narrow__note">
          Creating as <strong>{user.userName}</strong>. Pick a category for your
          listing.
        </p>

        <ListingForm
          productName={form.productName}
          price={form.price}
          categoryId={form.categoryId}
          categories={form.categories}
          fieldErrors={form.fieldErrors}
          formError={form.formError}
          submitting={form.submitting}
          onProductNameChange={form.changeProductName}
          onPriceChange={form.changePrice}
          onCategoryChange={form.changeCategory}
          onSubmit={form.submit}
        />

        <BackToProducts />
      </main>
    </div>
  );
}
