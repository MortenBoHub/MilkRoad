import type { Category } from "@/api/Api";
import type { CategoryDraft, CategoryEdit } from "@/atoms/adminCategoriesAtom";
import type { LoadState } from "@/atoms/productsAtom";

export interface AdminCategoryManagerProps {
  categories: Category[];
  status: LoadState;
  error: string | null;
  actionError: string | null;
  busy: boolean;
  draft: CategoryDraft;
  editing: CategoryEdit | null;
  onChangeDraft: (patch: Partial<CategoryDraft>) => void;
  onSubmitDraft: () => void;
  onStartEdit: (category: Category) => void;
  onChangeEdit: (patch: Partial<CategoryEdit>) => void;
  onSubmitEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (category: Category) => void;
}

/**
 * COMPONENTS layer: props in, JSX out. No state, no fetching — the view and its
 * hook own that. Renders the add form and the category table with inline edit.
 */
export function AdminCategoryManager({
  categories,
  status,
  error,
  actionError,
  busy,
  draft,
  editing,
  onChangeDraft,
  onSubmitDraft,
  onStartEdit,
  onChangeEdit,
  onSubmitEdit,
  onCancelEdit,
  onDelete,
}: AdminCategoryManagerProps) {
  return (
    <section className="admin">
      <form
        className="admin__add"
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) onSubmitDraft();
        }}
      >
        <div className="admin__add-fields">
          <label className="admin__field">
            <span className="admin__label">Name</span>
            <input
              className="form__input"
              value={draft.name}
              onChange={(event) => onChangeDraft({ name: event.target.value })}
              placeholder="Ice Cream"
              maxLength={100}
            />
          </label>

          <label className="admin__field">
            <span className="admin__label">Slug</span>
            <input
              className="form__input"
              value={draft.slug}
              onChange={(event) => onChangeDraft({ slug: event.target.value })}
              placeholder="auto from name"
              maxLength={50}
            />
          </label>

          <label className="admin__toggle">
            <input
              type="checkbox"
              checked={draft.available}
              onChange={(event) =>
                onChangeDraft({ available: event.target.checked })
              }
            />
            Available now
          </label>
        </div>

        <button className="form__submit" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add category"}
        </button>
      </form>

      {actionError ? (
        <p className="form__error" role="alert">
          {actionError}
        </p>
      ) : null}

      {status === "loading" ? (
        <p className="admin__note">Loading…</p>
      ) : status === "error" ? (
        <p className="form__error" role="alert">
          {error}
        </p>
      ) : categories.length === 0 ? (
        <p className="admin__note">No categories yet.</p>
      ) : (
        <table className="admin__table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Slug</th>
              <th>Availability</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const rowKey = category.id ?? category.slug ?? "?";

              if (editing && category.id === editing.id) {
                return (
                  <tr key={rowKey} className="admin__row admin__row--editing">
                    <td>
                      <input
                        className="form__input"
                        value={editing.name}
                        onChange={(event) =>
                          onChangeEdit({ name: event.target.value })
                        }
                        maxLength={100}
                      />
                    </td>
                    <td>
                      <code className="admin__slug">{editing.slug}</code>
                    </td>
                    <td>
                      <label className="admin__toggle">
                        <input
                          type="checkbox"
                          checked={editing.available}
                          onChange={(event) =>
                            onChangeEdit({ available: event.target.checked })
                          }
                        />
                        {editing.available ? "Available" : "Soon"}
                      </label>
                    </td>
                    <td className="admin__actions">
                      <button
                        type="button"
                        className="admin__button admin__button--save"
                        onClick={onSubmitEdit}
                        disabled={busy}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="admin__button"
                        onClick={onCancelEdit}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={rowKey} className="admin__row">
                  <td>{category.name ?? "(unnamed)"}</td>
                  <td>
                    <code className="admin__slug">{category.slug}</code>
                  </td>
                  <td>
                    <span
                      className={
                        category.isAvailable
                          ? "badge badge--for-sale"
                          : "badge badge--not-for-sale"
                      }
                    >
                      {category.isAvailable ? "Available" : "Soon"}
                    </span>
                  </td>
                  <td className="admin__actions">
                    <button
                      type="button"
                      className="admin__button"
                      onClick={() => onStartEdit(category)}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin__button admin__button--danger"
                      onClick={() => onDelete(category)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
