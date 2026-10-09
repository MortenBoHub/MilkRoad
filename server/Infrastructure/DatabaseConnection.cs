using DefaultNamespace.Entities;
using LinqToDB;
using LinqToDB.Data;

namespace Infrastructure;

public class DatabaseConnection(DataOptions<DatabaseConnection> options) : DataConnection(options.Options)
{
    public ITable<Products> Products => this.GetTable<Products>();
    public ITable<User> Users => this.GetTable<User>();
    public ITable<Category> Categories => this.GetTable<Category>();
}