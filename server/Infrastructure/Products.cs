using LinqToDB.Mapping;

namespace DefaultNamespace.Entities;

[Table("Products")]
public class Products
{
    [PrimaryKey, Identity]
    public int Id { get; set; }

    [Column("ProductName"), NotNull]
    public string ProductName { get; set; } = "";

    [Column("Price"), NotNull]
    public decimal Price { get; set; }
}