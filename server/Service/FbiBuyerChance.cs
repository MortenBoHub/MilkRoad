namespace Service;

public interface IFbiBuyerChance
{
    bool IsTriggered();
}

public sealed class RandomFbiBuyerChance : IFbiBuyerChance
{
    public bool IsTriggered() => Random.Shared.Next(100) == 0;
}
