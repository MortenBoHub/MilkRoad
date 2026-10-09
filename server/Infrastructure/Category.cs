using LinqToDB.Mapping;

namespace DefaultNamespace.Entities;

[LinqToDB.Mapping.Table("categories")]
public class Category
{
    [LinqToDB.Mapping.Column("id"), PrimaryKey, Identity]
    public int Id { get; set; }

    // Stable key products are filed under; it never changes, so renaming the
    // label can't orphan them.
    [LinqToDB.Mapping.Column("slug"), NotNull]
    public string Slug { get; set; } = string.Empty;

    // Display label ("Ice Cream"); the admin may rename it.
    [LinqToDB.Mapping.Column("name"), NotNull]
    public string Name { get; set; } = string.Empty;

    // "Soon" categories show in the sidebar but can't be chosen for a listing.
    [LinqToDB.Mapping.Column("IsAvailable"), NotNull]
    public bool IsAvailable { get; set; }
}
