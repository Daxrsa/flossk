using FlosskMS.Business.DTOs;
using FlosskMS.Data;
using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlosskMS.Business.Services;

public class ContributionService : IContributionService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<ContributionService> _logger;

    // Scoring weights
    private const int CreatorBonus = 10;
    private const int ObjectiveCompletedPoints = 5;
    private const int ResourceCreatedPoints = 2;
    private const int ParticipationPoints = 3;

    public ContributionService(ApplicationDbContext dbContext, ILogger<ContributionService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IActionResult> CalculateProjectContributionsAsync(Guid projectId)
    {
        var project = await _dbContext.Projects
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.UploadedFiles)
            .Include(p => p.Objectives)
                .ThenInclude(o => o.TeamMembers)
            .Include(p => p.Resources)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return new NotFoundObjectResult(new { Error = "Project not found." });

        if (project.Status != ProjectStatus.Completed)
            return new BadRequestObjectResult(new { Error = "Contributions can only be calculated for completed projects." });

        // Check if contributions already exist for this project
        var existing = await _dbContext.UserContributions
            .AnyAsync(uc => uc.ProjectId == projectId);

        if (existing)
            return new ConflictObjectResult(new { Error = "Contributions already calculated for this project. Use recalculate if needed." });

        var contributions = BuildContributions(project);

        _dbContext.UserContributions.AddRange(contributions);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Calculated contributions for project {ProjectId}: {Count} users scored", projectId, contributions.Count);

        return new OkObjectResult(contributions.Select(c => MapToDto(c, project.Title)));
    }

    public async Task<IActionResult> RecalculateProjectContributionsAsync(Guid projectId)
    {
        var project = await _dbContext.Projects
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.UploadedFiles)
            .Include(p => p.Objectives)
                .ThenInclude(o => o.TeamMembers)
            .Include(p => p.Resources)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return new NotFoundObjectResult(new { Error = "Project not found." });

        if (project.Status != ProjectStatus.Completed)
            return new BadRequestObjectResult(new { Error = "Contributions can only be calculated for completed projects." });

        // Remove existing contributions
        var existing = await _dbContext.UserContributions
            .Where(uc => uc.ProjectId == projectId)
            .ToListAsync();

        if (existing.Count > 0)
            _dbContext.UserContributions.RemoveRange(existing);

        var contributions = BuildContributions(project);

        _dbContext.UserContributions.AddRange(contributions);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Recalculated contributions for project {ProjectId}: {Count} users scored", projectId, contributions.Count);

        return new OkObjectResult(contributions.Select(c => MapToDto(c, project.Title)));
    }

    public async Task<IActionResult> GetProjectContributionsAsync(Guid projectId)
    {
        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return new NotFoundObjectResult(new { Error = "Project not found." });

        var contributions = await _dbContext.UserContributions
            .AsNoTracking()
            .Include(uc => uc.User)
                .ThenInclude(u => u.UploadedFiles)
            .Where(uc => uc.ProjectId == projectId)
            .OrderByDescending(uc => uc.Score)
            .ToListAsync();

        return new OkObjectResult(contributions.Select(c => MapToDto(c, project.Title)));
    }

    public async Task<IActionResult> GetUserContributionsAsync(string userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
            return new NotFoundObjectResult(new { Error = "User not found." });

        var contributions = await _dbContext.UserContributions
            .AsNoTracking()
            .Include(uc => uc.Project)
            .Include(uc => uc.User)
                .ThenInclude(u => u.UploadedFiles)
            .Where(uc => uc.UserId == userId)
            .OrderByDescending(uc => uc.Score)
            .ToListAsync();

        return new OkObjectResult(contributions.Select(c => MapToDto(c, c.Project.Title)));
    }

    public async Task<IActionResult> GetLeaderboardAsync(int top = 50)
    {
        var leaderboard = await _dbContext.UserContributions
            .AsNoTracking()
            .Include(uc => uc.User)
                .ThenInclude(u => u.UploadedFiles)
            .GroupBy(uc => uc.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                TotalScore = g.Sum(c => c.Score),
                ProjectsCompleted = g.Count(),
                TotalObjectivesCompleted = g.Sum(c => c.ObjectivesCompleted),
                TotalResourcesCreated = g.Sum(c => c.ResourcesCreated),
            })
            .OrderByDescending(x => x.TotalScore)
            .Take(top)
            .ToListAsync();

        // Fetch user details for leaderboard entries
        var userIds = leaderboard.Select(l => l.UserId).ToList();
        var users = await _dbContext.Users
            .AsNoTracking()
            .Include(u => u.UploadedFiles)
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id);

        var result = leaderboard.Select((entry, index) =>
        {
            var user = users.GetValueOrDefault(entry.UserId);
            var profilePic = user?.UploadedFiles?
                .FirstOrDefault(f => f.FileType == FileType.ProfilePicture);

            return new LeaderboardEntryDto
            {
                UserId = entry.UserId,
                FirstName = user?.FirstName ?? string.Empty,
                LastName = user?.LastName ?? string.Empty,
                Email = user?.Email,
                ProfilePictureUrl = profilePic != null ? $"/uploads/{profilePic.FileName}" : null,
                TotalScore = entry.TotalScore,
                ProjectsCompleted = entry.ProjectsCompleted,
                TotalObjectivesCompleted = entry.TotalObjectivesCompleted,
                TotalResourcesCreated = entry.TotalResourcesCreated,
                Rank = index + 1
            };
        }).ToList();

        return new OkObjectResult(result);
    }

    #region Private Helpers

    private List<UserContribution> BuildContributions(Project project)
    {
        var contributions = new List<UserContribution>();

        foreach (var member in project.TeamMembers)
        {
            var objectivesCompleted = project.Objectives
                .Count(o => o.Status == ObjectiveStatus.Completed
                         && o.TeamMembers.Any(tm => tm.UserId == member.UserId));

            var resourcesCreated = project.Resources
                .Count(r => r.CreatedByUserId == member.UserId);

            var isCreator = project.CreatedByUserId == member.UserId;

            var score = ParticipationPoints
                      + (objectivesCompleted * ObjectiveCompletedPoints)
                      + (resourcesCreated * ResourceCreatedPoints)
                      + (isCreator ? CreatorBonus : 0);

            contributions.Add(new UserContribution
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = member.UserId,
                ObjectivesCompleted = objectivesCompleted,
                ResourcesCreated = resourcesCreated,
                IsProjectCreator = isCreator,
                Score = score,
                CalculatedAt = DateTime.UtcNow
            });
        }

        return contributions;
    }

    private static UserContributionDto MapToDto(UserContribution c, string projectTitle)
    {
        var profilePic = c.User?.UploadedFiles?
            .FirstOrDefault(f => f.FileType == FileType.ProfilePicture);

        return new UserContributionDto
        {
            Id = c.Id,
            ProjectId = c.ProjectId,
            ProjectTitle = projectTitle,
            UserId = c.UserId,
            FirstName = c.User?.FirstName ?? string.Empty,
            LastName = c.User?.LastName ?? string.Empty,
            ProfilePictureUrl = profilePic != null ? $"/uploads/{profilePic.FileName}" : null,
            ObjectivesCompleted = c.ObjectivesCompleted,
            ResourcesCreated = c.ResourcesCreated,
            IsProjectCreator = c.IsProjectCreator,
            Score = c.Score,
            CalculatedAt = c.CalculatedAt
        };
    }

    #endregion
}
