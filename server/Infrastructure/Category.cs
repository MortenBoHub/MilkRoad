using LinqToDB.Mapping;

namespace DefaultNamespace.Entities;

[Table("categories")]
public class Category
{
    [Column("id"), PrimaryKey, Identity]
    public int Id { get; set; }

    [Column("name"), NotNull]
    public string Name { get; set; } = string.Empty;
}