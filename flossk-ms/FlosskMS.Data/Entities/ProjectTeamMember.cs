namespace FlosskMS.Data.Entities;

/// <summary>
/// Join table for Project-ApplicationUser many-to-many relationship
/// </summary>
public class ProjectTeamMember
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public string? Role { get; set; } // Optional role within the project (e.g., "Lead", "Developer", "Designer")
}
