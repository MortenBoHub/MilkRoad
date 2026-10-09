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

        // CreateIfNotExists never alters an existing table, so add newer columns
        // in place; the pragma check keeps each fix idempotent.
        if (!HasColumn("Products", "Category"))
            db.Execute(
                $"ALTER TABLE Products ADD COLUMN Category TEXT NOT NULL DEFAULT '{Products.DefaultCategory}'");

        if (!HasColumn("Users", "IsAdmin"))
            db.Execute("ALTER TABLE Users ADD COLUMN IsAdmin INTEGER NOT NULL DEFAULT 0");

        if (!HasColumn("categories", "slug"))
            db.Execute("ALTER TABLE categories ADD COLUMN slug TEXT NOT NULL DEFAULT ''");

        if (!HasColumn("categories", "IsAvailable"))
            db.Execute("ALTER TABLE categories ADD COLUMN IsAvailable INTEGER NOT NULL DEFAULT 1");

        SeedCategoriesIfEmpty();
        SeedAdminsIfMissing();
    }

    private bool HasColumn(string table, string column) =>
        db.Query<string>($"SELECT name FROM pragma_table_info('{table}')")
            .Any(name => string.Equals(name, column, StringComparison.OrdinalIgnoreCase));

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
