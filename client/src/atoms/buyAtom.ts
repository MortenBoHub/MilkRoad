import { useState } from "react";
import type { BuyResult } from "@/api/Api";

/**
 * ATOMS layer: state for the buy flow. `buyingId` marks the card mid-purchase;
 * `raid` holds the FBI result that drives the shutdown popup.
 */
export function useBuyState() {
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [raid, setRaid] = useState<BuyResult | null>(null);

  return { buyingId, setBuyingId, error, setError, raid, setRaid };
}
