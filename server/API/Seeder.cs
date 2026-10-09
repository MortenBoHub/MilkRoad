using DefaultNamespace.Entities;
using Infrastructure;
using LinqToDB;
using LinqToDB.Data;
using Microsoft.AspNetCore.Identity;

namespace API;

public class Seeder(DatabaseConnection db)
{
    // The demo admins. The password is deliberately the same for both.
    private const string AdminPassword = "123456";
    private static readonly string[] AdminUserNames = ["AdminMorten", "AdminJes"];

    // Starting categories: slug, label, available.
    private static readonly (string Slug, string Name, bool Available)[] SeedCategories =
    [
        ("milk", "Milk", true),
        ("cheese", "Cheese", true),
        ("butter", "Butter", true),
        ("yogurt", "Yogurt", false),
        ("cream", "Cream", false),
        ("ice-cream", "Ice Cream", false),
        ("powdered", "Powdered", false),
        ("goat-sheep", "Goat & Sheep", false),
    ];

    public void seed()
    {
        db.CreateTable<Products>(tableOptions: TableOptions.CreateIfNotExists);
        db.CreateTable<User>(tableOptions: TableOptions.CreateIfNotExists);
        db.CreateTable<Category>(tableOptions: TableOptions.CreateIfNotExists);

        SeedCategoriesIfEmpty();
        SeedAdminsIfMissing();
    }

    private void SeedCategoriesIfEmpty()
    {
        if (db.GetTable<Category>().Any())
            return;

        foreach (var (slug, name, available) in SeedCategories)
        {
            db.Insert(new Category { Slug = slug, Name = name, IsAvailable = available });
        }
    }

    private void SeedAdminsIfMissing()
    {
        var hasher = new PasswordHasher<User>();

        foreach (var userName in AdminUserNames)
        {
            if (db.GetTable<User>().Any(u => u.UserName == userName))
                continue;

            var admin = new User { UserName = userName, IsAdmin = true };
            admin.PasswordHash = hasher.HashPassword(admin, AdminPassword);
            db.Insert(admin);
        }
    }
}
