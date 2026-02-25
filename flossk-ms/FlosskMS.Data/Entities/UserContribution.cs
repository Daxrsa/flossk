namespace FlosskMS.Data.Entities;

/// <summary>
/// Tracks a user's contribution to a completed project.
/// Scores are computed when a project transitions to Completed status.
/// </summary>
public class UserContribution
{
    public Guid Id { get; set; }

    // Which project
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    // Which user
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    // Contribution breakdown
    public int ObjectivesCompleted { get; set; }
    public int ResourcesCreated { get; set; }
    public bool IsProjectCreator { get; set; }

    // Total score (computed: creator bonus + objectives * weight + resources * weight)
    public int Score { get; set; }

    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
}
