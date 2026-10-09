namespace Service;

/// <summary>
/// Outcome of a purchase.
///
/// <c>Total</c> is what the buyer is charged. <c>ShutDownVendors</c> names any
/// vendors the FBI closed after intervening in the purchase: one 1% roll is made
/// per vendor in the cart, and the buyer still loses their money — the goods are
/// seized as evidence.
/// </summary>
public record BuyResult(
    decimal Total,
    bool FbiTriggered,
    List<string> ShutDownVendors);
