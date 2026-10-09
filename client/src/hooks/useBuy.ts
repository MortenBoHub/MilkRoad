import { useEffect } from "react";
import { api } from "@/api/client";
import { describeError } from "@/api/errors";
import { useBuyState } from "@/atoms/buyAtom";
import { useAuth } from "@/hooks/useAuth";

/**
 * HOOKS layer: buying, and the FBI popup it can trigger.
 *
 * Takes a `reload` callback (from useProducts) so a completed purchase can
 * refresh the marketplace — the bought item goes off-sale and any raided vendor
 * disappears entirely.
 */
export function useBuy(reload: () => void) {
  const { user } = useAuth();
  const { buyingId, setBuyingId, error, setError, raid, setRaid } =
    useBuyState();

  // Close the popup on Escape. Owned here (not in the component) so the screen
  // stays pure markup.
  useEffect(() => {
    if (!raid) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setRaid(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [raid, setRaid]);

  /** Buy one product. Resolves true on success (raid or not). */
  async function buy(productId: number): Promise<boolean> {
    if (!user) {
      setError("You need an account to buy. Sign in first.");
      return false;
    }

    setBuyingId(productId);
    setError(null);

    try {
      const result = await api.api.baseUserBuy(
        { buyerId: user.userId },
        { productIds: [productId] },
      );

      if (result.fbiTriggered) setRaid(result);
      reload();
      return true;
    } catch (err) {
      setError(await describeError(err));
      return false;
    } finally {
      setBuyingId(null);
    }
  }

  function dismissRaid() {
    setRaid(null);
  }

  return { buy, buyingId, error, raid, dismissRaid };
}
