namespace Service;

public interface IFbiBuyerChance
{
    bool IsTriggered();
}

/// <summary>
/// Decides whether the FBI intervenes in a purchase and closes the vendor.
///
/// In normal operation this is a 1% chance, rolled once per vendor in the cart.
/// For demos the environment variable <c>MR_FORCE_FBI</c> can be set to "1" (or
/// "true") to force an intervention on every roll
/// </summary>
public sealed class RandomFbiBuyerChance : IFbiBuyerChance
{
    private static readonly bool Force =
        Environment.GetEnvironmentVariable("MR_FORCE_FBI") is { } value &&
        (value == "1" || value.Equals("true", StringComparison.OrdinalIgnoreCase));

    public bool IsTriggered() => Force || Random.Shared.Next(100) == 0;
}
