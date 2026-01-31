using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IProjectService
{
    // Project operations
    Task<IActionResult> CreateProjectAsync(CreateProjectDto request, string userId);
    Task<IActionResult> GetProjectsAsync(string? status = null);
    Task<IActionResult> GetProjectByIdAsync(Guid id);
    Task<IActionResult> UpdateProjectAsync(Guid id, UpdateProjectDto request);
    Task<IActionResult> UpdateProjectStatusAsync(Guid id, string status);
    Task<IActionResult> DeleteProjectAsync(Guid id);

    // Project team member operations
    Task<IActionResult> AddTeamMemberToProjectAsync(Guid projectId, AddTeamMemberDto request);
    Task<IActionResult> RemoveTeamMemberFromProjectAsync(Guid projectId, string userId);
    Task<IActionResult> GetProjectTeamMembersAsync(Guid projectId);

    // Objective operations
    Task<IActionResult> CreateObjectiveAsync(CreateObjectiveDto request, string userId);
    Task<IActionResult> GetObjectiveByIdAsync(Guid id);
    Task<IActionResult> GetObjectivesByProjectIdAsync(Guid projectId);
    Task<IActionResult> UpdateObjectiveAsync(Guid id, UpdateObjectiveDto request);
    Task<IActionResult> UpdateObjectiveStatusAsync(Guid id, string status);
    Task<IActionResult> DeleteObjectiveAsync(Guid id);

    // Objective team member operations
    Task<IActionResult> AssignTeamMemberToObjectiveAsync(Guid objectiveId, AssignObjectiveTeamMemberDto request);
    Task<IActionResult> RemoveTeamMemberFromObjectiveAsync(Guid objectiveId, string userId);
    Task<IActionResult> GetObjectiveTeamMembersAsync(Guid objectiveId);

    // Resource operations
    Task<IActionResult> CreateResourceAsync(CreateResourceDto request);
    Task<IActionResult> GetResourceByIdAsync(Guid id);
    Task<IActionResult> GetResourcesByProjectIdAsync(Guid projectId);
    Task<IActionResult> GetResourcesByObjectiveIdAsync(Guid objectiveId);
    Task<IActionResult> UpdateResourceAsync(Guid id, UpdateResourceDto request);
    Task<IActionResult> DeleteResourceAsync(Guid id);

    // Seed and cleanup operations
    Task<IActionResult> SeedProjectsAsync(string userId);
    Task<IActionResult> DeleteAllProjectsAsync();
}
