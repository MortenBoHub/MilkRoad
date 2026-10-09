import type { LoadState } from "@/atoms/productsAtom";

/**
 * COMPONENTS layer: the "waiting / failed" panel, styled like an old-web message
 * box so it sits alongside the marketplace chrome.
 *
 * "success" is intentionally not rendered (the view shows the grid instead) but
 * is accepted so a caller can pass the raw status without narrowing it first.
 *
 * A11y: loading is `role="status"` + `aria-live="polite"` (not urgent); errors
 * are `role="alert"` (announced immediately).
 */
export function StatusMessage({
  status,
  error,
}: {
  status: LoadState;
  error: string | null;
}) {
  if (status === "success") return null;

  if (status === "error") {
    return (
      <div className="status status--error" role="alert">
        <div className="status__bar">Error</div>
        <div className="status__body">
          <span className="status__glyph" aria-hidden="true">
            !
          </span>
          <span className="status__text">
            Could not load products: {error ?? "unknown error"}
          </span>
        </div>
      </div>
    );
  }

  // "idle" only exists for the instant before the effect runs.
  return (
    <div className="status status--loading" role="status" aria-live="polite">
      <div className="status__bar">Loading</div>
      <div className="status__body">
        <span className="status__spinner" aria-hidden="true" />
        <span className="status__text">Loading products…</span>
      </div>
    </div>
  );
}
