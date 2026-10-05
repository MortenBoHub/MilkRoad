
using DefaultNamespace.Entities;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;

namespace Service;

public class ProductService
{
    private readonly DataConnection _db;
    private readonly IFbiBuyerChance _fbiBuyerChance;

    private const int BulkDiscountThreshold = 10;
    private const decimal BulkDiscountRate = 0.20m;

    public ProductService(DataConnection db, IFbiBuyerChance? fbiBuyerChance = null)
    {
        _db = db;
        _fbiBuyerChance = fbiBuyerChance ?? new RandomFbiBuyerChance();
    }

    // Reads all products
    public Task<List<Products>> GetAllProductsAsync() =>
        _db.GetTable<Products>().ToListAsync();

    // Reads one product
    public virtual Task<Products?> GetByIdAsync(int id) =>
        _db.GetTable<Products>()
            .FirstOrDefaultAsync(p => p.Id == id);

    // Creates a product
    public async Task<Products> CreateAsync(Products product)
    {
        product.Id = await _db.InsertWithInt32IdentityAsync(product);
        return product;
    }

    // Updates a product
    public async Task<bool> UpdateAsync(Products product) =>
        await _db.UpdateAsync(product) > 0;

    // Deletes a product
    public async Task<bool> DeleteAsync(int id) =>
        await _db.GetTable<Products>()
            .DeleteAsync(p => p.Id == id) > 0;

    // Selling
    public virtual async Task<bool> SetForSaleAsync(
        int productId,
        int userId,
        bool forSale)
    {
        var rows = await _db.GetTable<Products>()
            .Where(p => p.Id == productId && p.UserId == userId)
            .Set(p => p.IsForSale, forSale)
            .UpdateAsync();

        return rows > 0;
    }

    // Buying one product
    public virtual async Task<bool> BuyAsync(
        int productId,
        int buyerId)
    {
        await using var transaction = await _db.BeginTransactionAsync();

        var product = await _db.GetTable<Products>()
            .FirstOrDefaultAsync(p =>
                p.Id == productId &&
                p.IsForSale &&
                p.UserId != buyerId);

        if (product is null)
            return false;

        // FBI chance
        if (_fbiBuyerChance.IsTriggered())
        {
            var deletedProducts = await _db.GetTable<Products>()
                .DeleteAsync(p => p.UserId == product.UserId);

            var deletedUser = await _db.GetTable<User>()
                .DeleteAsync(u => u.UserId == product.UserId);

            if (deletedUser == 0)
                return false;

            await transaction.CommitAsync();

            return deletedProducts > 0;
        }

        // Normal purchase
        var updated = await _db.GetTable<Products>()
            .Where(p =>
                p.Id == productId &&
                p.IsForSale &&
                p.UserId != buyerId)
            .Set(p => p.UserId, buyerId)
            .Set(p => p.IsForSale, false)
            .UpdateAsync();

        if (updated == 0)
            return false;

        await transaction.CommitAsync();

        return true;
    }

    // Buying multiple products
    public async Task<decimal?> BuyAsync(
        List<int> productIds,
        int buyerId)
    {
        var ids = productIds
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return null;

        await using var transaction = await _db.BeginTransactionAsync();

        // Buy all products
        var bought = await _db.GetTable<Products>()
            .Where(p =>
                ids.Contains(p.Id) &&
                p.IsForSale &&
                p.UserId != buyerId)
            .Set(p => p.UserId, buyerId)
            .Set(p => p.IsForSale, false)
            .UpdateAsync();

        // Not all requested products could be bought
        if (bought != ids.Count)
            return null;

        // Calculate subtotal
        var subtotal = await _db.GetTable<Products>()
            .Where(p => ids.Contains(p.Id))
            .SumAsync(p => p.Price);

        await transaction.CommitAsync();

        // Apply bulk discount
        var total = ids.Count >= BulkDiscountThreshold
            ? subtotal * (1 - BulkDiscountRate)
            : subtotal;

        return Math.Round(total, 2);
    }
}
