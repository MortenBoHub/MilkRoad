using DefaultNamespace.Entities;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;

namespace Service;

public class ProductService
{
    private readonly DataConnection _db;
    private readonly IFbiBuyerChance _fbiBuyerChance;

    public ProductService(DataConnection db, IFbiBuyerChance? fbiBuyerChance = null)
    {
        _db = db;
        _fbiBuyerChance = fbiBuyerChance ?? new RandomFbiBuyerChance();
    }

    //Reads all 
    public Task<List<Products>> GetAllProductsAsync() =>
        _db.GetTable<Products>().ToListAsync();

    //Reads one
    public virtual Task<Products?> GetByIdAsync(int id) =>
        _db.GetTable<Products>().FirstOrDefaultAsync(p => p.Id == id);

    // Creates
    public virtual async Task<Products> CreateAsync(Products product)
    {
        product.Id = await _db.InsertWithInt32IdentityAsync(product);
        return product;
    }

    //Update
    public async Task<bool> UpdateAsync(Products product) =>
        await _db.UpdateAsync(product) > 0;

    //Delete
    public virtual async Task<bool> DeleteAsync(int id) =>
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
    public virtual async Task<bool> BuyAsync(int productId, int buyerId)
    {
        await using var transaction = await _db.BeginTransactionAsync();

        var product = await _db.GetTable<Products>()
            .FirstOrDefaultAsync(p => p.Id == productId && p.IsForSale && p.UserId != buyerId);

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
            .Where(p => p.Id == productId && p.IsForSale && p.UserId != buyerId)
            .Set(p => p.UserId, buyerId)
            .Set(p => p.IsForSale, false)
            .UpdateAsync();

        if (updated == 0)
            return false;

        await transaction.CommitAsync();
        return true;
    }
}