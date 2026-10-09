import { api } from "@/api/client";
import { describeError } from "@/api/errors";
import {
  useListingFormState,
  type ListingFieldErrors,
} from "@/atoms/listingFormAtom";
import {
  availableCategories,
  DEFAULT_CATEGORY_ID,
  findCategory,
  type MarketCategory,
} from "@/categories";
import { useAuth } from "@/hooks/useAuth";

/**
 * HOOKS layer: creating a listing.
 *
 * Create the product, then flip it to "for sale" via the existing Sell endpoint
 * (products start `IsForSale = false` but a listing should be sellable). The two
 * calls are sequential because we need the new id from the first.
 *
 * The category list is injected by the view, so this hook does no fetching.
 */

function validate(
  productName: string,
  price: string,
  categoryId: string,
  categories: MarketCategory[],
): ListingFieldErrors {
  const errors: ListingFieldErrors = {};

  const name = productName.trim();
  if (!name) {
    errors.productName = "Name is required.";
  } else if (name.length > 200) {
    errors.productName = "Name must be 200 characters or fewer.";
  }

  if (!price.trim()) {
    errors.price = "Price is required.";
  } else {
    const value = Number(price);
    if (!Number.isFinite(value) || value <= 0) {
      errors.price = "Price must be a number greater than 0.";
    }
  }

  const category = findCategory(categories, categoryId);
  if (!category || !category.available) {
    errors.category = "Pick an available category.";
  }

  return errors;
}

export function useCreateListing(categories: MarketCategory[]) {
  const { user } = useAuth();
  const state = useListingFormState(DEFAULT_CATEGORY_ID);
  const choices = availableCategories(categories);

  function changeProductName(value: string) {
    state.setProductName(value);
    if (state.fieldErrors.productName) {
      state.setFieldErrors((prev) => ({ ...prev, productName: undefined }));
    }
    state.setError(null);
    if (state.status === "error") state.setStatus("idle");
  }

  function changePrice(value: string) {
    state.setPrice(value);
    if (state.fieldErrors.price) {
      state.setFieldErrors((prev) => ({ ...prev, price: undefined }));
    }
    state.setError(null);
    if (state.status === "error") state.setStatus("idle");
  }

  function changeCategory(value: string) {
    state.setCategoryId(value);
    if (state.fieldErrors.category) {
      state.setFieldErrors((prev) => ({ ...prev, category: undefined }));
    }
    state.setError(null);
    if (state.status === "error") state.setStatus("idle");
  }

  /** Validate, create the product, mark it for sale. Resolves true on success. */
  async function submit(): Promise<boolean> {
    const errors = validate(
      state.productName,
      state.price,
      state.categoryId,
      categories,
    );
    state.setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return false;

    if (!user) {
      state.setError("You must be signed in to create a listing.");
      state.setStatus("error");
      return false;
    }

    state.setStatus("submitting");
    state.setError(null);

    try {
      const created = await api.api.productCreate({
        userId: user.userId,
        productName: state.productName.trim(),
        price: Number(state.price),
        category: state.categoryId,
      });

      // A listing has to be for sale, so flip it on. If the id is missing we
      // still created something — don't fail the whole flow over it.
      if (typeof created.id === "number") {
        await api.api.baseUserSell({
          userId: user.userId,
          productId: created.id,
        });
      }

      state.setStatus("success");
      return true;
    } catch (err) {
      state.setError(await describeError(err));
      state.setStatus("error");
      return false;
    }
  }

  return {
    status: state.status,
    productName: state.productName,
    price: state.price,
    categoryId: state.categoryId,
    fieldErrors: state.fieldErrors,
    formError: state.status === "error" ? state.error : null,
    submitting: state.status === "submitting",
    categories: choices,
    changeProductName,
    changePrice,
    changeCategory,
    submit,
  };
}
