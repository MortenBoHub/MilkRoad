using DefaultNamespace.Entities;
using Infrastructure;
using LinqToDB;

namespace API;

public class Seeder(DatabaseConnection db)
{
    public void seed()
    {
        db.CreateTable<Products>(tableOptions: TableOptions.CreateIfNotExists);
        db.CreateTable<User>(tableOptions: TableOptions.CreateIfNotExists);
    }
}