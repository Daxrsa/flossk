namespace FlosskMS.Business.DTOs;

/// <summary>
/// Aggregated leaderboard entry for a user across all completed projects.
/// </summary>
public class LeaderboardEntryDto
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public int TotalScore { get; set; }
    public int ProjectsCompleted { get; set; }
    public int TotalObjectivesCompleted { get; set; }
    public int TotalResourcesCreated { get; set; }
    public int Rank { get; set; }
}
