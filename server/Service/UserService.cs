using Microsoft.AspNetCore.Identity;
using DefaultNamespace.Entities;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;

namespace DefaultNamespace.Services;

public class UserService
{
    private readonly DataConnection _db;

    public UserService(DataConnection db)
    {
        _db = db;
    }

    // Get all users with their products
    public Task<List<User>> GetAllWithProductsAsync() =>
        _db.GetTable<User>()
            .LoadWith(u => u.UserProducts)
            .ToListAsync();

    // Get one user with their products
    public Task<User?> GetByIdWithProductsAsync(int id) =>
        _db.GetTable<User>()
            .LoadWith(u => u.UserProducts)
            .FirstOrDefaultAsync(u => u.UserId == id);
    
    //Create user 
    public async Task<User> CreateuserAsync(User user)
    {
        user.UserId = await _db.InsertWithInt32IdentityAsync(user);
        return user;
    }

    private readonly PasswordHasher<User> _hasher = new();

    public async Task<User?> RegisterAsync(string userName, string password)
    {
        if (await _db.GetTable<User>().AnyAsync(u => u.UserName == userName))
            return null;//name already taken
        
        var user = new User { UserName = userName };
        user.PasswordHash = _hasher.HashPassword(user, password);
        user.UserId = await _db.InsertWithInt32IdentityAsync(user);
        return user;
    }

    public async Task<User?> LoginAsync(String userName, String password)
    {
        var user = await _db.GetTable<User>().FirstOrDefaultAsync(u => u.UserName == userName);
        if (user is null) return null;

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        return result == PasswordVerificationResult.Failed ? null : user;
    }
    
    //Update

    public async Task<bool> UpdateUserAsync(User user)
    {
        var existing = await _db.GetTable<User>()
            .FirstOrDefaultAsync(u => u.UserId == user.UserId);

        if (existing is null)
            return false; 

        if (existing.UserName == user.UserName)
            return false; 

        existing.UserName = user.UserName;
        await _db.UpdateAsync(existing);
        return true;
    }
    
    //Deletes Users and their products
    
    public async Task<bool> DeleteUserAsync(int id)
    {
        await using var tx = await _db.BeginTransactionAsync();

        await _db.GetTable<Products>().DeleteAsync(p => p.UserId == id);
        var rows = await _db.GetTable<User>().DeleteAsync(u => u.UserId == id);

        await tx.CommitAsync();
        return rows > 0;
    }
    

    
    

}