using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IContributionService
{
    /// <summary>
    /// Calculate and store contribution scores for all team members of a completed project.
    /// Called automatically when a project transitions to Completed status.
    /// </summary>
    Task<IActionResult> CalculateProjectContributionsAsync(Guid projectId);

    /// <summary>
    /// Recalculate contributions for a project (e.g. if data was corrected).
    /// </summary>
    Task<IActionResult> RecalculateProjectContributionsAsync(Guid projectId);

    /// <summary>
    /// Get contribution details for a specific project.
    /// </summary>
    Task<IActionResult> GetProjectContributionsAsync(Guid projectId);

    /// <summary>
    /// Get all contributions for a specific user across all completed projects.
    /// </summary>
    Task<IActionResult> GetUserContributionsAsync(string userId);

    /// <summary>
    /// Get the overall leaderboard ranked by total score.
    /// </summary>
    Task<IActionResult> GetLeaderboardAsync(int top = 50);
}
