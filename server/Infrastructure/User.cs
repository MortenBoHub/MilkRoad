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
    
    [Column("Passwordhash"), NotNull,JsonIgnore]
    public string PasswordHash { get; set; } = "";

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(Products.UserId))]
    public List<Products> UserProducts { get; set; } = new();
}
