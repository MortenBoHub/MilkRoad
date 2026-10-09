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

    public Task<List<Products>> GetAllProductsAsync() =>
        _db.GetTable<Products>().ToListAsync();

    // Any product filed under this slug? Blocks deleting an in-use category.
    public Task<bool> AnyInCategoryAsync(string slug) =>
        _db.GetTable<Products>().AnyAsync(p => p.Category == slug);

    public virtual Task<Products?> GetByIdAsync(int id) =>
        _db.GetTable<Products>()
            .FirstOrDefaultAsync(p => p.Id == id);

    public virtual async Task<Products> CreateAsync(Products product)
    {
        product.Id = await _db.InsertWithInt32IdentityAsync(product);
        return product;
    }

    public async Task<bool> UpdateAsync(Products product) =>
        await _db.UpdateAsync(product) > 0;

    public virtual async Task<bool> DeleteAsync(int id) =>
        await _db.GetTable<Products>()
            .DeleteAsync(p => p.Id == id) > 0;

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

    public virtual async Task<BuyResult?> BuyAsync(
        List<int> productIds,
        int buyerId)
    {
        var ids = productIds
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return null;

        await using var transaction = await _db.BeginTransactionAsync();

        var products = await _db.GetTable<Products>()
            .Where(p =>
                ids.Contains(p.Id) &&
                p.IsForSale &&
                p.UserId != buyerId)
            .ToListAsync();

        if (products.Count != ids.Count)
            return null;

        // Charged for the whole attempt, so the subtotal is taken before any deletion.
        var subtotal = products.Sum(p => p.Price);

        var shutDownVendors = new List<string>();

        // One roll per vendor; ordered by vendor id so the rolls stay deterministic.
        foreach (var vendor in products.GroupBy(p => p.UserId).OrderBy(g => g.Key))
        {
            if (_fbiBuyerChance.IsTriggered())
            {
                // Raid: the vendor is closed for good and their products seized,
                // but the buyer still pays and receives nothing.
                var owner = await _db.GetTable<User>()
                    .FirstOrDefaultAsync(u => u.UserId == vendor.Key);

                await _db.GetTable<Products>()
                    .DeleteAsync(p => p.UserId == vendor.Key);

                await _db.GetTable<User>()
                    .DeleteAsync(u => u.UserId == vendor.Key);

                shutDownVendors.Add(owner?.UserName ?? $"user #{vendor.Key}");
                continue;
            }

            var vendorIds = vendor.Select(p => p.Id).ToList();

            await _db.GetTable<Products>()
                .Where(p => vendorIds.Contains(p.Id))
                .Set(p => p.UserId, buyerId)
                .Set(p => p.IsForSale, false)
                .UpdateAsync();
        }

        await transaction.CommitAsync();

        var total = ids.Count >= BulkDiscountThreshold
            ? subtotal * (1 - BulkDiscountRate)
            : subtotal;

        return new BuyResult(
            Math.Round(total, 2),
            shutDownVendors.Count > 0,
            shutDownVendors);
    }
    
    
    public virtual async Task<bool> SetDescriptionAsync(
        int productId,
        int userId,
        string description)
    {
        var rows = await _db.GetTable<Products>()
            .Where(p => p.Id == productId && p.UserId == userId)
            .Set(p => p.Description, description)
            .UpdateAsync();

        return rows > 0;
    }
}
