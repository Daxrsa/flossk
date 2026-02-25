namespace FlosskMS.Business.DTOs;

/// <summary>
/// A user's contribution to a single completed project.
/// </summary>
public class UserContributionDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
    public int ObjectivesCompleted { get; set; }
    public int ResourcesCreated { get; set; }
    public bool IsProjectCreator { get; set; }
    public int Score { get; set; }
    public DateTime CalculatedAt { get; set; }
}
