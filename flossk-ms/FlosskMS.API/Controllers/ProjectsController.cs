using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    private readonly IProjectService _projectService = projectService;

    #region Project Endpoints

    /// <summary>
    /// Create a new project (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _projectService.CreateProjectAsync(request, userId);
    }

    /// <summary>
    /// Get all projects with pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjects(
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        return await _projectService.GetProjectsAsync(status, search);
    }

    /// <summary>
    /// Get a project by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProject(Guid id)
    {
        return await _projectService.GetProjectByIdAsync(id);
    }

    /// <summary>
    /// Update a project (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto request)
    {
        return await _projectService.UpdateProjectAsync(id, request);
    }

    /// <summary>
    /// Delete a project (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        return await _projectService.DeleteProjectAsync(id);
    }

    #endregion

    #region Project Team Member Endpoints

    /// <summary>
    /// Get all team members of a project
    /// </summary>
    [HttpGet("{projectId:guid}/team-members")]
    public async Task<IActionResult> GetProjectTeamMembers(Guid projectId)
    {
        return await _projectService.GetProjectTeamMembersAsync(projectId);
    }

    /// <summary>
    /// Add a team member to a project (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("{projectId:guid}/team-members")]
    public async Task<IActionResult> AddTeamMemberToProject(Guid projectId, [FromBody] AddTeamMemberDto request)
    {
        return await _projectService.AddTeamMemberToProjectAsync(projectId, request);
    }

    /// <summary>
    /// Remove a team member from a project (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{projectId:guid}/team-members/{userId}")]
    public async Task<IActionResult> RemoveTeamMemberFromProject(Guid projectId, string userId)
    {
        return await _projectService.RemoveTeamMemberFromProjectAsync(projectId, userId);
    }

    #endregion

    #region Objective Endpoints

    /// <summary>
    /// Get all objectives of a project
    /// </summary>
    [HttpGet("{projectId:guid}/objectives")]
    public async Task<IActionResult> GetProjectObjectives(Guid projectId)
    {
        return await _projectService.GetObjectivesByProjectIdAsync(projectId);
    }

    /// <summary>
    /// Create a new objective (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("objectives")]
    public async Task<IActionResult> CreateObjective([FromBody] CreateObjectiveDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _projectService.CreateObjectiveAsync(request, userId);
    }

    /// <summary>
    /// Get an objective by ID
    /// </summary>
    [HttpGet("objectives/{id:guid}")]
    public async Task<IActionResult> GetObjective(Guid id)
    {
        return await _projectService.GetObjectiveByIdAsync(id);
    }

    /// <summary>
    /// Update an objective (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("objectives/{id:guid}")]
    public async Task<IActionResult> UpdateObjective(Guid id, [FromBody] UpdateObjectiveDto request)
    {
        return await _projectService.UpdateObjectiveAsync(id, request);
    }

    /// <summary>
    /// Delete an objective (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("objectives/{id:guid}")]
    public async Task<IActionResult> DeleteObjective(Guid id)
    {
        return await _projectService.DeleteObjectiveAsync(id);
    }

    #endregion

    #region Objective Team Member Endpoints

    /// <summary>
    /// Get all team members of an objective
    /// </summary>
    [HttpGet("objectives/{objectiveId:guid}/team-members")]
    public async Task<IActionResult> GetObjectiveTeamMembers(Guid objectiveId)
    {
        return await _projectService.GetObjectiveTeamMembersAsync(objectiveId);
    }

    /// <summary>
    /// Assign a team member to an objective (Admin only)
    /// User must already be a team member of the project
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("objectives/{objectiveId:guid}/team-members")]
    public async Task<IActionResult> AssignTeamMemberToObjective(Guid objectiveId, [FromBody] AssignObjectiveTeamMemberDto request)
    {
        return await _projectService.AssignTeamMemberToObjectiveAsync(objectiveId, request);
    }

    /// <summary>
    /// Remove a team member from an objective (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("objectives/{objectiveId:guid}/team-members/{userId}")]
    public async Task<IActionResult> RemoveTeamMemberFromObjective(Guid objectiveId, string userId)
    {
        return await _projectService.RemoveTeamMemberFromObjectiveAsync(objectiveId, userId);
    }

    #endregion

    #region Resource Endpoints

    /// <summary>
    /// Get all resources of a project
    /// </summary>
    [HttpGet("{projectId:guid}/resources")]
    public async Task<IActionResult> GetProjectResources(Guid projectId)
    {
        return await _projectService.GetResourcesByProjectIdAsync(projectId);
    }

    /// <summary>
    /// Get all resources of an objective
    /// </summary>
    [HttpGet("objectives/{objectiveId:guid}/resources")]
    public async Task<IActionResult> GetObjectiveResources(Guid objectiveId)
    {
        return await _projectService.GetResourcesByObjectiveIdAsync(objectiveId);
    }

    /// <summary>
    /// Create a new resource (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("resources")]
    public async Task<IActionResult> CreateResource([FromBody] CreateResourceDto request)
    {
        return await _projectService.CreateResourceAsync(request);
    }

    /// <summary>
    /// Get a resource by ID
    /// </summary>
    [HttpGet("resources/{id:guid}")]
    public async Task<IActionResult> GetResource(Guid id)
    {
        return await _projectService.GetResourceByIdAsync(id);
    }

    /// <summary>
    /// Update a resource (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("resources/{id:guid}")]
    public async Task<IActionResult> UpdateResource(Guid id, [FromBody] UpdateResourceDto request)
    {
        return await _projectService.UpdateResourceAsync(id, request);
    }

    /// <summary>
    /// Delete a resource (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("resources/{id:guid}")]
    public async Task<IActionResult> DeleteResource(Guid id)
    {
        return await _projectService.DeleteResourceAsync(id);
    }

    #endregion

    #region Seed and Cleanup Endpoints

    /// <summary>
    /// Seed sample projects, objectives, and resources (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("seed")]
    public async Task<IActionResult> SeedProjects()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _projectService.SeedProjectsAsync(userId);
    }

    /// <summary>
    /// Delete all projects and related data (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("all")]
    public async Task<IActionResult> DeleteAllProjects()
    {
        return await _projectService.DeleteAllProjectsAsync();
    }

    #endregion
}
