using DefaultNamespace.Entities;
using Infrastructure;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;
using Microsoft.Data.Sqlite;
using Service;
using Xunit;

namespace Tests;

public class ProductServiceTests
{
    [Fact]
    public async Task BuyAsync_WhenFbiChanceTriggers_DeletesOnlyProductOwnersProductsAndUser()
    {
        await using var connection = new SqliteConnection("Data Source=FbiPurchaseTest1;Mode=Memory;Cache=Shared");
        await connection.OpenAsync();
        await using var db = CreateDatabase(connection);

        var productOwner = await AddUser(db, "product-owner");
        var purchasingUser = await AddUser(db, "purchasing-user");
        var otherUser = await AddUser(db, "other-user");
        var targetProduct = await AddProduct(db, productOwner.UserId, "Target", true);
        await AddProduct(db, productOwner.UserId, "Another product", false);
        var otherProduct = await AddProduct(db, otherUser.UserId, "Unrelated", true);

        var service = new ProductService(db, new FixedFbiBuyerChance(true));

        Assert.True(await service.BuyAsync(targetProduct.Id, purchasingUser.UserId));
        Assert.Null(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == productOwner.UserId));
        Assert.Empty(await db.GetTable<Products>().Where(p => p.UserId == productOwner.UserId).ToListAsync());
        Assert.NotNull(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == purchasingUser.UserId));
        Assert.NotNull(await db.GetTable<Products>().FirstOrDefaultAsync(p => p.Id == otherProduct.Id));
    }

    [Fact]
    public async Task BuyAsync_WhenFbiChanceDoesNotTrigger_TransfersOnlyPurchasedProductBetweenUsers()
    {
        await using var connection = new SqliteConnection("Data Source=FbiPurchaseTest2;Mode=Memory;Cache=Shared");
        await connection.OpenAsync();
        await using var db = CreateDatabase(connection);

        var firstUser = await AddUser(db, "first-user");
        var secondUser = await AddUser(db, "second-user");
        var targetProduct = await AddProduct(db, firstUser.UserId, "Target", true);
        var otherProduct = await AddProduct(db, firstUser.UserId, "Another product", false);
        var secondUsersProduct = await AddProduct(db, secondUser.UserId, "Second users product", false);

        var service = new ProductService(db, new FixedFbiBuyerChance(false));

        Assert.True(await service.BuyAsync(targetProduct.Id, secondUser.UserId));
        Assert.NotNull(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == firstUser.UserId));
        var purchased = await db.GetTable<Products>().FirstOrDefaultAsync(p => p.Id == targetProduct.Id);
        Assert.NotNull(purchased);
        Assert.Equal(secondUser.UserId, purchased!.UserId);
        Assert.False(purchased.IsForSale);
        Assert.Equal(firstUser.UserId,
            (await db.GetTable<Products>().FirstAsync(p => p.Id == otherProduct.Id)).UserId);
        Assert.Equal(secondUser.UserId,
            (await db.GetTable<Products>().FirstAsync(p => p.Id == secondUsersProduct.Id)).UserId);
    }

    [Fact]
    public async Task BuyAsync_Multi_WhenFbiDoesNotTrigger_TransfersEveryProductAndChargesSubtotal()
    {
        await using var connection = new SqliteConnection("Data Source=FbiMultiNoTrigger;Mode=Memory;Cache=Shared");
        await connection.OpenAsync();
        await using var db = CreateDatabase(connection);

        var vendorA = await AddUser(db, "vendor-a");
        var vendorB = await AddUser(db, "vendor-b");
        var buyer = await AddUser(db, "buyer");

        var a1 = await AddProduct(db, vendorA.UserId, "A1", true, 5m);
        var a2 = await AddProduct(db, vendorA.UserId, "A2", true, 3m);
        var b1 = await AddProduct(db, vendorB.UserId, "B1", true, 2m);

        var service = new ProductService(db, new FixedFbiBuyerChance(false));

        var result = await service.BuyAsync(new List<int> { a1.Id, a2.Id, b1.Id }, buyer.UserId);

        Assert.NotNull(result);
        Assert.False(result!.FbiTriggered);
        Assert.Empty(result.ShutDownVendors);
        Assert.Equal(10m, result.Total);

        foreach (var id in new[] { a1.Id, a2.Id, b1.Id })
        {
            var product = await db.GetTable<Products>().FirstAsync(p => p.Id == id);
            Assert.Equal(buyer.UserId, product.UserId);
            Assert.False(product.IsForSale);
        }

        Assert.NotNull(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == vendorA.UserId));
        Assert.NotNull(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == vendorB.UserId));
    }

    [Fact]
    public async Task BuyAsync_Multi_WhenFbiTriggersForOneVendor_RaidsThatVendorAndStillChargesBuyer()
    {
        await using var connection = new SqliteConnection("Data Source=FbiMultiOneTrigger;Mode=Memory;Cache=Shared");
        await connection.OpenAsync();
        await using var db = CreateDatabase(connection);

        // vendorA is created first, so it has the lower id and is rolled first.
        var vendorA = await AddUser(db, "raid-me");
        var vendorB = await AddUser(db, "safe-vendor");
        var buyer = await AddUser(db, "buyer");

        var a1 = await AddProduct(db, vendorA.UserId, "A1", true, 7m);
        await AddProduct(db, vendorA.UserId, "A2", true); // not in the cart
        var b1 = await AddProduct(db, vendorB.UserId, "B1", true, 4m);

        // Roll 1 (vendorA) triggers, roll 2 (vendorB) does not.
        var service = new ProductService(db, new SequenceFbiBuyerChance(true, false));

        var result = await service.BuyAsync(new List<int> { a1.Id, b1.Id }, buyer.UserId);

        Assert.NotNull(result);
        Assert.True(result!.FbiTriggered);
        Assert.Equal(new[] { "raid-me" }, result.ShutDownVendors);
        // Charged for both the seized and the delivered item.
        Assert.Equal(11m, result.Total);

        // Raided vendor is gone, along with every product they listed.
        Assert.Null(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == vendorA.UserId));
        Assert.Empty(await db.GetTable<Products>().Where(p => p.UserId == vendorA.UserId).ToListAsync());

        // Safe vendor keeps their account; their cart item went to the buyer.
        Assert.NotNull(await db.GetTable<User>().FirstOrDefaultAsync(u => u.UserId == vendorB.UserId));
        var delivered = await db.GetTable<Products>().FirstAsync(p => p.Id == b1.Id);
        Assert.Equal(buyer.UserId, delivered.UserId);
        Assert.False(delivered.IsForSale);
    }

    private static DatabaseConnection CreateDatabase(SqliteConnection connection)
    {
        var options = new DataOptions().UseSQLite(connection.ConnectionString);
        var db = new DatabaseConnection(new DataOptions<DatabaseConnection>(options));
        db.CreateTable<User>();
        db.CreateTable<Products>();
        return db;
    }

    private static async Task<User> AddUser(DatabaseConnection db, string name)
    {
        var user = new User { UserName = name, PasswordHash = "test" };
        user.UserId = await db.InsertWithInt32IdentityAsync(user);
        return user;
    }

    private static async Task<Products> AddProduct(
        DatabaseConnection db, int userId, string name, bool isForSale, decimal price = 1)
    {
        var product = new Products
        {
            UserId = userId,
            ProductName = name,
            Price = price,
            IsForSale = isForSale
        };
        product.Id = await db.InsertWithInt32IdentityAsync(product);
        return product;
    }

    private sealed class FixedFbiBuyerChance(bool triggered) : IFbiBuyerChance
    {
        public bool IsTriggered() => triggered;
    }

    /// <summary>Returns a scripted sequence of rolls, one per call, for multi-vendor tests.</summary>
    private sealed class SequenceFbiBuyerChance(params bool[] triggers) : IFbiBuyerChance
    {
        private readonly Queue<bool> _triggers = new(triggers);

        public bool IsTriggered() =>
            _triggers.Count > 0 && _triggers.Dequeue();
    }
}
