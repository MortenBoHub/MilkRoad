using DefaultNamespace.Entities;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;

namespace Service;

public class ProductService
{
    private readonly DataConnection _db;

    public ProductService(DataConnection db)
    {
        _db = db;
    }

    //Reads all 
    public Task<List<Products>> GetAllProductsAsync() =>
        _db.GetTable<Products>().ToListAsync();

    //Reads one
    public virtual Task<Products?> GetByIdAsync(int id) =>
        _db.GetTable<Products>().FirstOrDefaultAsync(p => p.Id == id);

    // Creates

    public async Task<Products> CreateAsync(Products product)
    {
        product.Id = await _db.InsertWithInt32IdentityAsync(product);
        return product;
    }

    //Update
    public async Task<bool> UpdateAsync(Products product) =>
        await _db.UpdateAsync(product) > 0;

    //Delete
    public async Task<bool> DeleteAsync(int id) =>
        await _db.GetTable<Products>().DeleteAsync(p => p.Id == id) > 0;

    //Selling 
    public virtual async Task<bool> SetForSaleAsync(int productId, int userId, bool forSale)
    {
        var rows = await _db.GetTable<Products>()
            .Where(p => p.Id == productId && p.UserId == userId)
            .Set(p => p.IsForSale, forSale)
            .UpdateAsync();

        return rows > 0;
    }

    //Buying
    
    private const int BulkDiscountThreshold = 10;
    private const decimal BulkDiscountRate = 0.20m;
    public async Task<decimal?> BuyAsync(List<int> productIds, int buyerId)
    {
        var ids = productIds.Distinct().ToList();
        if (ids.Count == 0) return null;

        await using var transaction = await _db.BeginTransactionAsync();

        var bought = await _db.GetTable<Products>()
            .Where(p => ids.Contains(p.Id) && p.IsForSale && p.UserId != buyerId)
            .Set(p => p.UserId, buyerId)
            .Set(p => p.IsForSale, false)
            .UpdateAsync();

        if (bought != ids.Count) return null;

        var subtotal = await _db.GetTable<Products>()
            .Where(p => ids.Contains(p.Id))
            .SumAsync(p => p.Price);

        await transaction.CommitAsync();

        var total = ids.Count >= BulkDiscountThreshold
            ? subtotal * (1 - BulkDiscountRate)
            : subtotal;

        return Math.Round(total, 2);
        {
        }
    }
}
        
    

    
    
}