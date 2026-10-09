import type { FormEvent } from "react";
import type { ListingFieldErrors } from "@/atoms/listingFormAtom";
import type { MarketCategory } from "@/categories";

export interface ListingFormProps {
  productName: string;
  price: string;
  categoryId: string;
  categories: MarketCategory[];
  fieldErrors: ListingFieldErrors;
  formError: string | null;
  submitting: boolean;
  onProductNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * COMPONENTS layer: props in, JSX out. Presentational — no state, no validation.
 *
 * The category `<select>` is driven by the `categories` prop (fetched from the
 * server and filtered to the available ones by the hook).
 */
export function ListingForm({
  productName,
  price,
  categoryId,
  categories,
  fieldErrors,
  formError,
  submitting,
  onProductNameChange,
  onPriceChange,
  onCategoryChange,
  onSubmit,
}: ListingFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    onSubmit();
  }

  return (
    <section className="form">
      <div className="form__bar">New listing</div>

      <form className="form__body" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="form__error" role="alert">
            {formError}
          </p>
        ) : null}

        <label className="form__field">
          <span className="form__label">Product name</span>
          <input
            className="form__input"
            type="text"
            name="productName"
            value={productName}
            onChange={(event) => onProductNameChange(event.target.value)}
            maxLength={200}
            autoFocus
            aria-invalid={Boolean(fieldErrors.productName)}
          />
          {fieldErrors.productName ? (
            <span className="form__field-error">{fieldErrors.productName}</span>
          ) : null}
        </label>

        <label className="form__field">
          <span className="form__label">Price (MOO)</span>
          <input
            className="form__input"
            type="number"
            name="price"
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
            min="0.01"
            step="0.01"
            inputMode="decimal"
            aria-invalid={Boolean(fieldErrors.price)}
          />
          {fieldErrors.price ? (
            <span className="form__field-error">{fieldErrors.price}</span>
          ) : null}
        </label>

        <label className="form__field">
          <span className="form__label">Category</span>
          <select
            className="form__input"
            name="category"
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          {fieldErrors.category ? (
            <span className="form__field-error">{fieldErrors.category}</span>
          ) : null}
        </label>

        <button className="form__submit" type="submit" disabled={submitting}>
          {submitting ? "Publishing…" : "Create listing"}
        </button>
      </form>
    </section>
  );
}
