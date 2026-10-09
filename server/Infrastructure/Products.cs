using System.ComponentModel.DataAnnotations.Schema;
using LinqToDB.Mapping;

namespace DefaultNamespace.Entities;

[LinqToDB.Mapping.Table("Products")]
public class Products
{

    [PrimaryKey, Identity]
    public int Id { get; set; }

    [LinqToDB.Mapping.Column("UserId"), NotNull]
    public int UserId { get; set; }

    [LinqToDB.Mapping.Column("ProductName"), NotNull]
    public string ProductName { get; set; } = "";
    
    [LinqToDB.Mapping.Column("Decscription")]

    public string Description { get; set; } = "";
    
    [LinqToDB.Mapping.Column("Price"), NotNull]
    public decimal Price { get; set; }

    /// <summary>The category every product falls into when none is given.</summary>
    public const string DefaultCategory = "milk";

    // Category slug ("milk", "cheese", …) chosen when the listing was made.
    [LinqToDB.Mapping.Column("Category"), NotNull]
    public string Category { get; set; } = DefaultCategory;

    [LinqToDB.Mapping.Column("IsForSale"), NotNull]
    public bool IsForSale { get; set; }

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(User.UserId))]
    public User? User { get; set; }
}
