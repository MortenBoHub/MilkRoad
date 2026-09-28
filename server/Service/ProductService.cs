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
}

    
    
