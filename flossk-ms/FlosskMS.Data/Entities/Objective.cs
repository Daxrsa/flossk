namespace FlosskMS.Data.Entities;

public class Objective
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ObjectiveStatus Status { get; set; } = ObjectiveStatus.Todo;
    public int Points { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Project relationship (an objective belongs to one project)
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    // Creator tracking
    public string CreatedByUserId { get; set; } = string.Empty;
    public ApplicationUser CreatedByUser { get; set; } = null!;

    // Navigation properties
    public ICollection<ObjectiveTeamMember> TeamMembers { get; set; } = [];
    public ICollection<Resource> Resources { get; set; } = [];
}
