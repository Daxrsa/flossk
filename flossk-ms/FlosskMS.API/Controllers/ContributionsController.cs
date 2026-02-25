using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ContributionsController(IContributionService contributionService) : ControllerBase
{
    private readonly IContributionService _contributionService = contributionService;

    /// <summary>
    /// Get the overall leaderboard ranked by total contribution score.
    /// </summary>
    /// <param name="top">Number of top users to return (default: 50)</param>
    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int top = 50)
    {
        return await _contributionService.GetLeaderboardAsync(top);
    }

    /// <summary>
    /// Get contribution details for a specific completed project.
    /// </summary>
    [HttpGet("project/{projectId:guid}")]
    public async Task<IActionResult> GetProjectContributions(Guid projectId)
    {
        return await _contributionService.GetProjectContributionsAsync(projectId);
    }

    /// <summary>
    /// Get all contributions for a specific user across completed projects.
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserContributions(string userId)
    {
        return await _contributionService.GetUserContributionsAsync(userId);
    }

    /// <summary>
    /// Calculate contributions for a completed project (Admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("project/{projectId:guid}/calculate")]
    public async Task<IActionResult> CalculateProjectContributions(Guid projectId)
    {
        return await _contributionService.CalculateProjectContributionsAsync(projectId);
    }

    /// <summary>
    /// Recalculate contributions for a completed project (Admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("project/{projectId:guid}/recalculate")]
    public async Task<IActionResult> RecalculateProjectContributions(Guid projectId)
    {
        return await _contributionService.RecalculateProjectContributionsAsync(projectId);
    }
}
