namespace FlosskMS.Data.Entities;

public class Log
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>The type of entity that was acted upon, e.g. "Inventory"</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>String representation of the entity ID</summary>
    public string EntityId { get; set; } = string.Empty;

    /// <summary>Human-readable name of the entity at the time of the action</summary>
    public string EntityName { get; set; } = string.Empty;

    /// <summary>Short action label, e.g. "Item created", "Checked out", "Image added"</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Optional extra context (e.g. image file name, field that changed)</summary>
    public string? Detail { get; set; }

    /// <summary>User who performed the action</summary>
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
