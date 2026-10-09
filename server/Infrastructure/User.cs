using System.Text.Json.Serialization;
using LinqToDB.Mapping;

namespace DefaultNamespace.Entities;

[Table("Users")]
public class User
{
    [PrimaryKey, Identity]
    public int UserId { get; set; }

    [Column("UserName"), NotNull]
    public string UserName { get; set; } = "";

    [Column("Passwordhash"), NotNull, JsonIgnore]
    public string PasswordHash { get; set; } = "";

    // Seeded demo admins only; registration never sets this.
    [Column("IsAdmin"), NotNull]
    public bool IsAdmin { get; set; }

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(Products.UserId))]
    public List<Products> UserProducts { get; set; } = new();
}
