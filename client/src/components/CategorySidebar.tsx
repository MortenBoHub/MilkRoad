import type { MarketCategory } from "@/categories";

export interface CategorySidebarProps {
  categories: MarketCategory[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
  loading?: boolean;
}

/**
 * COMPONENTS layer: the left-hand rail of the marketplace.
 *
 * The list is server-owned (fetched by the view and passed in). Available
 * categories are filter buttons; the rest are marked "soon" and not clickable.
 */
export function CategorySidebar({
  categories,
  selectedId,
  onSelect,
  loading = false,
}: CategorySidebarProps) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__heading">Categories</h2>
      {loading ? (
        <p className="sidebar__note">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="sidebar__note">No categories yet.</p>
      ) : (
        <ul className="sidebar__list">
          {categories.map((category) => {
            if (!category.available) {
              return (
                <li key={category.id}>
                  <span className="sidebar__item sidebar__item--disabled">
                    {category.label}
                    <span className="sidebar__item-tag">soon</span>
                  </span>
                </li>
              );
            }

            const isActive = category.id === selectedId;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className={
                    isActive
                      ? "sidebar__item sidebar__item--active"
                      : "sidebar__item"
                  }
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onSelect(category.id)}
                >
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
