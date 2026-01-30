namespace FlosskMS.Data.Entities;

/// <summary>
/// Join table for Objective-ApplicationUser many-to-many relationship
/// Note: A user can only be added to an objective if they are already a member of the project
/// </summary>
public class ObjectiveTeamMember
{
    public Guid Id { get; set; }
    public Guid ObjectiveId { get; set; }
    public Objective Objective { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
