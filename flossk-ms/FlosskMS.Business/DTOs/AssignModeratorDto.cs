namespace FlosskMS.Business.DTOs;

/// <summary>
/// DTO for assigning or removing a project moderator.
/// Set ModeratorUserId to null to remove the current moderator.
/// </summary>
public class AssignModeratorDto
{
    /// <summary>
    /// The user ID to assign as moderator, or null to remove the moderator.
    /// </summary>
    public string? ModeratorUserId { get; set; }
}
