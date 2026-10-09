import type { BuyResult } from "@/api/Api";

export interface FbiRaidScreenProps {
  result: BuyResult;
  onDismiss: () => void;
}

/** Original parody badge — our own artwork, no real insignia. */
function RaidBadge() {
  return (
    <svg
      className="raid__badge"
      viewBox="0 0 64 72"
      role="img"
      aria-label="Federal dairy bureau badge"
    >
      <path
        d="M32 3 L59 12 V34 C59 50 47 62 32 69 C17 62 5 50 5 34 V12 Z"
        fill="#1a0f0d"
        stroke="#f2c14e"
        strokeWidth="2.5"
      />
      <path
        d="M32 12 L50 18 V34 C50 45 42 54 32 59 C22 54 14 45 14 34 V18 Z"
        fill="none"
        stroke="#7a2a1f"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize="20"
        fontFamily="Georgia, serif"
        fill="#f2c14e"
      >
        ☠
      </text>
    </svg>
  );
}

/**
 * COMPONENTS layer: the "the FBI shut down this stand" centered modal, shown when
 * a purchase returns `fbiTriggered`. Purely presentational — the hook decides
 * when it appears and how it dismisses.
 */
export function FbiRaidScreen({ result, onDismiss }: FbiRaidScreenProps) {
  const vendors = result.shutDownVendors ?? [];
  const total = result.total ?? 0;

  return (
    <div
      className="raid"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="raid-title"
    >
      <div className="raid__backdrop" onClick={onDismiss} />
      <div className="raid__panel">
        <div className="raid__tape">Federal Dairy Investigation</div>
        <RaidBadge />
        <h2 className="raid__title" id="raid-title">
          The FBI shut down this stand
        </h2>
        <p className="raid__body">
          {vendors.length > 0 ? (
            <>
              A federal raid closed <strong>{vendors.join(", ")}</strong> during
              your purchase. Their whole stand has been permanently removed from
              MilkRoad.
            </>
          ) : (
            <>
              A federal raid closed the vendor during your purchase. Their whole
              stand has been permanently removed from The MilkRoad.
            </>
          )}
        </p>
        <p className="raid__loss">
          You were charged <strong>{total.toFixed(2)} MOO</strong> and left
          empty-handed. Dairy crime doesn&apos;t pay.
        </p>
        <button
          type="button"
          className="raid__dismiss"
          onClick={onDismiss}
          autoFocus
        >
          Return to The MilkRoad.
        </button>
      </div>
    </div>
  );
}
