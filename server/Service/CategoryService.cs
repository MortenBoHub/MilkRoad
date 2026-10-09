using DefaultNamespace.Entities;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;

namespace Service;

public class CategoryService(DataConnection db)
{
    public virtual async Task<List<Category>> GetAllCategoriesAsync()
    {
        return await db.GetTable<Category>().ToListAsync();
    }

    public virtual async Task<Category?> GetByIdAsync(int id)
    {
        return await db.GetTable<Category>().FirstOrDefaultAsync(c => c.Id == id);
    }

    // By slug. null means it's free to create, or missing on delete/update.
    public virtual async Task<Category?> GetBySlugAsync(string slug)
    {
        return await db.GetTable<Category>().FirstOrDefaultAsync(c => c.Slug == slug);
    }

    public virtual async Task<Category> CreateAsync(Category category)
    {
        category.Id = await db.InsertWithInt32IdentityAsync(category);
        return category;
    }

    public virtual async Task UpdateAsync(Category category)
    {
        await db.UpdateAsync(category);
    }

    public virtual async Task DeleteAsync(int id)
    {
        await db.GetTable<Category>().Where(c => c.Id == id).DeleteAsync();
    }
}
