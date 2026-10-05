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
        DatabaseConnection db, int userId, string name, bool isForSale)
    {
        var product = new Products
        {
            UserId = userId,
            ProductName = name,
            Price = 1,
            IsForSale = isForSale
        };
        product.Id = await db.InsertWithInt32IdentityAsync(product);
        return product;
    }

    private sealed class FixedFbiBuyerChance(bool triggered) : IFbiBuyerChance
    {
        public bool IsTriggered() => triggered;
    }
}
