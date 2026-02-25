using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IProjectService
{
    // Project operations
    Task<IActionResult> CreateProjectAsync(CreateProjectDto request, string userId);
    Task<IActionResult> GetProjectsAsync(string? status = null);
    Task<IActionResult> GetProjectsByUserIdAsync(string userId);
    Task<IActionResult> GetProjectByIdAsync(Guid id);
    Task<IActionResult> UpdateProjectAsync(Guid id, UpdateProjectDto request, string? userId = null);
    Task<IActionResult> UpdateProjectStatusAsync(Guid id, string status, string? userId = null);
    Task<IActionResult> DeleteProjectAsync(Guid id, string? userId = null);

    // Project team member operations
    Task<IActionResult> AddTeamMemberToProjectAsync(Guid projectId, AddTeamMemberDto request, string? addedByUserId = null);
    Task<IActionResult> RemoveTeamMemberFromProjectAsync(Guid projectId, string userId, string currentUserId);
    Task<IActionResult> RemoveTeamMembersFromProjectAsync(Guid projectId, RemoveTeamMembersDto request, string currentUserId);
    Task<IActionResult> GetProjectTeamMembersAsync(Guid projectId);
    Task<IActionResult> JoinProjectAsync(Guid projectId, string userId);
    Task<IActionResult> LeaveProjectAsync(Guid projectId, string userId);

    // Objective operations
    Task<IActionResult> CreateObjectiveAsync(CreateObjectiveDto request, string userId);
    Task<IActionResult> GetObjectiveByIdAsync(Guid id);
    Task<IActionResult> GetObjectivesByProjectIdAsync(Guid projectId);
    Task<IActionResult> UpdateObjectiveAsync(Guid id, UpdateObjectiveDto request, string? userId = null);
    Task<IActionResult> UpdateObjectiveStatusAsync(Guid id, string status, string? userId = null);
    Task<IActionResult> DeleteObjectiveAsync(Guid id, string? userId = null);

    // Objective team member operations
    Task<IActionResult> AssignTeamMemberToObjectiveAsync(Guid objectiveId, AssignObjectiveTeamMemberDto request, string currentUserId);
    Task<IActionResult> RemoveTeamMemberFromObjectiveAsync(Guid objectiveId, string userId, string currentUserId);
    Task<IActionResult> GetObjectiveTeamMembersAsync(Guid objectiveId);
    Task<IActionResult> JoinObjectiveAsync(Guid objectiveId, string userId);
    Task<IActionResult> LeaveObjectiveAsync(Guid objectiveId, string userId);

    // Resource operations
    Task<IActionResult> CreateResourceAsync(CreateResourceDto request, string userId);
    Task<IActionResult> GetResourceByIdAsync(Guid id);
    Task<IActionResult> GetResourcesByProjectIdAsync(Guid projectId);
    Task<IActionResult> GetResourcesByObjectiveIdAsync(Guid objectiveId);
    Task<IActionResult> UpdateResourceAsync(Guid id, UpdateResourceDto request, string? userId = null);
    Task<IActionResult> DeleteResourceAsync(Guid id, string? userId = null);

    // Seed and cleanup operations
    Task<IActionResult> SeedProjectsAsync(string userId);
    Task<IActionResult> DeleteAllProjectsAsync();
}
