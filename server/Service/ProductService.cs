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

    public Task<Products?> GetByIdAsync(int id) =>
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
    public async Task<bool> SetForSaleAsync(int productId, int userId, bool forSale)
    {
        var rows = await _db.GetTable<Products>()
            .Where(p => p.Id == productId && p.UserId == userId)
            .Set(p => p.IsForSale, forSale)
            .UpdateAsync();

        return rows > 0;
    }
    //Buying
    public async Task<bool> BuyAsync(int productId, int buyerId) =>
        await _db.GetTable<Products>()
            .Where(p => p.Id == productId && p.IsForSale && p.UserId != buyerId)
            .Set(p => p.UserId, buyerId)
            .Set(p => p.IsForSale, false)
            .UpdateAsync() > 0;
}

    
    
