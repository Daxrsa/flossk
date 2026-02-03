using AutoMapper;
using FlosskMS.Business.DTOs;
using FlosskMS.Data;
using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlosskMS.Business.Services;

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(
        ApplicationDbContext dbContext,
        IMapper mapper,
        ILogger<ProjectService> logger)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _logger = logger;
    }

    #region Project Operations

    public async Task<IActionResult> CreateProjectAsync(CreateProjectDto request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (!Enum.TryParse<ProjectStatus>(request.Status, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid status value. Valid values are: Upcoming, InProgress, Completed." });
        }

        if (request.EndDate < request.StartDate)
        {
            return new BadRequestObjectResult(new { Error = "End date must be after start date." });
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        var project = _mapper.Map<Project>(request);
        project.Id = Guid.NewGuid();
        project.CreatedAt = DateTime.UtcNow;
        project.CreatedByUserId = userId;

        _dbContext.Projects.Add(project);
        await _dbContext.SaveChangesAsync();

        project.CreatedByUser = user;

        _logger.LogInformation("Project {ProjectId} created by user {UserId}", project.Id, userId);

        return new OkObjectResult(_mapper.Map<ProjectDto>(project));
    }

    public async Task<IActionResult> GetProjectsAsync(string? status = null)
    {
        var query = _dbContext.Projects
            .Include(p => p.CreatedByUser)
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.UploadedFiles)
            .Include(p => p.Objectives)
            .Include(p => p.Resources)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            if (!Enum.TryParse<ProjectStatus>(status, true, out var projectStatus))
            {
                var validStatuses = string.Join(", ", Enum.GetNames<ProjectStatus>());
                return new BadRequestObjectResult(new { Error = $"Invalid status '{status}'. Valid statuses are: {validStatuses}" });
            }
            query = query.Where(p => p.Status == projectStatus);
        }

        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<ProjectListDto>>(projects));
    }

    public async Task<IActionResult> GetProjectByIdAsync(Guid id)
    {
        var project = await _dbContext.Projects
            .Include(p => p.CreatedByUser)
            .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.UploadedFiles)
            .Include(p => p.Objectives)
                .ThenInclude(o => o.CreatedByUser)
            .Include(p => p.Objectives)
                .ThenInclude(o => o.TeamMembers)
                    .ThenInclude(tm => tm.User)
                        .ThenInclude(u => u.UploadedFiles)
            .Include(p => p.Objectives)
                .ThenInclude(o => o.Resources)
            .Include(p => p.Resources)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        return new OkObjectResult(_mapper.Map<ProjectDto>(project));
    }

    public async Task<IActionResult> UpdateProjectAsync(Guid id, UpdateProjectDto request)
    {
        var project = await _dbContext.Projects.FindAsync(id);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (!Enum.TryParse<ProjectStatus>(request.Status, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid status value. Valid values are: Upcoming, InProgress, Completed." });
        }

        if (request.EndDate < request.StartDate)
        {
            return new BadRequestObjectResult(new { Error = "End date must be after start date." });
        }

        _mapper.Map(request, project);
        project.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Project {ProjectId} updated", project.Id);

        // Reload with related data
        return await GetProjectByIdAsync(id);
    }

    public async Task<IActionResult> DeleteProjectAsync(Guid id)
    {
        var project = await _dbContext.Projects.FindAsync(id);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        _dbContext.Projects.Remove(project);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Project {ProjectId} deleted", id);

        return new OkObjectResult(new { Message = "Project deleted successfully." });
    }

    public async Task<IActionResult> UpdateProjectStatusAsync(Guid id, string status)
    {
        var project = await _dbContext.Projects.FindAsync(id);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        if (!Enum.TryParse<ProjectStatus>(status, true, out var projectStatus))
        {
            var validStatuses = string.Join(", ", Enum.GetNames<ProjectStatus>());
            return new BadRequestObjectResult(new { Error = $"Invalid status '{status}'. Valid statuses are: {validStatuses}" });
        }

        project.Status = projectStatus;
        project.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Project {ProjectId} status updated to {Status}", id, status);

        return new OkObjectResult(new { Message = $"Project status updated to {projectStatus}." });
    }

    #endregion

    #region Project Team Member Operations

    public async Task<IActionResult> AddTeamMemberToProjectAsync(Guid projectId, AddTeamMemberDto request)
    {
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        var user = await _dbContext.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        var existingMember = await _dbContext.ProjectTeamMembers
            .FirstOrDefaultAsync(tm => tm.ProjectId == projectId && tm.UserId == request.UserId);

        if (existingMember != null)
        {
            return new BadRequestObjectResult(new { Error = "User is already a team member of this project." });
        }

        var teamMember = new ProjectTeamMember
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = request.UserId,
            Role = request.Role,
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.ProjectTeamMembers.Add(teamMember);
        await _dbContext.SaveChangesAsync();

        teamMember.User = user;

        _logger.LogInformation("User {UserId} added to project {ProjectId}", request.UserId, projectId);

        return new OkObjectResult(_mapper.Map<TeamMemberDto>(teamMember));
    }

    public async Task<IActionResult> RemoveTeamMemberFromProjectAsync(Guid projectId, string userId, string currentUserId)
    {
        // Check if the current user is the project creator
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        if (project.CreatedByUserId != currentUserId)
        {
            return new ForbidResult();
        }

        var teamMember = await _dbContext.ProjectTeamMembers
            .FirstOrDefaultAsync(tm => tm.ProjectId == projectId && tm.UserId == userId);

        if (teamMember == null)
        {
            return new NotFoundObjectResult(new { Error = "Team member not found in this project." });
        }

        // Also remove user from all objectives in this project
        var objectiveTeamMembers = await _dbContext.ObjectiveTeamMembers
            .Include(otm => otm.Objective)
            .Where(otm => otm.Objective.ProjectId == projectId && otm.UserId == userId)
            .ToListAsync();

        _dbContext.ObjectiveTeamMembers.RemoveRange(objectiveTeamMembers);
        _dbContext.ProjectTeamMembers.Remove(teamMember);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User {UserId} removed from project {ProjectId}", userId, projectId);

        return new OkObjectResult(new { Message = "Team member removed from project successfully." });
    }

    public async Task<IActionResult> GetProjectTeamMembersAsync(Guid projectId)
    {
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        var teamMembers = await _dbContext.ProjectTeamMembers
            .Include(tm => tm.User)
            .Where(tm => tm.ProjectId == projectId)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<TeamMemberDto>>(teamMembers));
    }

    public async Task<IActionResult> JoinProjectAsync(Guid projectId, string userId)
    {
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        if (project.Status == ProjectStatus.Completed)
        {
            return new BadRequestObjectResult(new { Error = "Cannot join a completed project." });
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        var existingMember = await _dbContext.ProjectTeamMembers
            .FirstOrDefaultAsync(tm => tm.ProjectId == projectId && tm.UserId == userId);

        if (existingMember != null)
        {
            return new BadRequestObjectResult(new { Error = "You are already a member of this project." });
        }

        var teamMember = new ProjectTeamMember
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = userId,
            Role = "Member",
            JoinedAt = DateTime.UtcNow
        };

        _dbContext.ProjectTeamMembers.Add(teamMember);
        await _dbContext.SaveChangesAsync();

        teamMember.User = user;

        _logger.LogInformation("User {UserId} joined project {ProjectId}", userId, projectId);

        return new OkObjectResult(_mapper.Map<TeamMemberDto>(teamMember));
    }

    public async Task<IActionResult> LeaveProjectAsync(Guid projectId, string userId)
    {
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        if (project.Status == ProjectStatus.Completed)
        {
            return new BadRequestObjectResult(new { Error = "Cannot leave a completed project." });
        }

        var teamMember = await _dbContext.ProjectTeamMembers
            .FirstOrDefaultAsync(tm => tm.ProjectId == projectId && tm.UserId == userId);

        if (teamMember == null)
        {
            return new NotFoundObjectResult(new { Error = "You are not a member of this project." });
        }

        // Also remove user from all objectives in this project
        var objectiveTeamMembers = await _dbContext.ObjectiveTeamMembers
            .Include(otm => otm.Objective)
            .Where(otm => otm.Objective.ProjectId == projectId && otm.UserId == userId)
            .ToListAsync();

        _dbContext.ObjectiveTeamMembers.RemoveRange(objectiveTeamMembers);
        _dbContext.ProjectTeamMembers.Remove(teamMember);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User {UserId} left project {ProjectId}", userId, projectId);

        return new OkObjectResult(new { Message = "You have left the project successfully." });
    }

    #endregion

    #region Objective Operations

    public async Task<IActionResult> CreateObjectiveAsync(CreateObjectiveDto request, string userId)
    {
        var project = await _dbContext.Projects.FindAsync(request.ProjectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (!Enum.TryParse<ObjectiveStatus>(request.Status, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid status value. Valid values are: Todo, InProgress, Completed." });
        }

        var objective = _mapper.Map<Objective>(request);
        objective.Id = Guid.NewGuid();
        objective.CreatedAt = DateTime.UtcNow;
        objective.CreatedByUserId = userId;

        _dbContext.Objectives.Add(objective);
        await _dbContext.SaveChangesAsync();

        // Set user for mapping
        objective.CreatedByUser = user;

        _logger.LogInformation("Objective {ObjectiveId} created for project {ProjectId} by user {UserId}", objective.Id, request.ProjectId, userId);

        return new OkObjectResult(_mapper.Map<ObjectiveDto>(objective));
    }

    public async Task<IActionResult> GetObjectiveByIdAsync(Guid id)
    {
        var objective = await _dbContext.Objectives
            .Include(o => o.CreatedByUser)
            .Include(o => o.TeamMembers)
                .ThenInclude(tm => tm.User)
            .Include(o => o.Resources)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        return new OkObjectResult(_mapper.Map<ObjectiveDto>(objective));
    }

    public async Task<IActionResult> GetObjectivesByProjectIdAsync(Guid projectId)
    {
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        var objectives = await _dbContext.Objectives
            .Include(o => o.CreatedByUser)
            .Include(o => o.TeamMembers)
                .ThenInclude(tm => tm.User)
            .Include(o => o.Resources)
            .Where(o => o.ProjectId == projectId)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<ObjectiveDto>>(objectives));
    }

    public async Task<IActionResult> UpdateObjectiveAsync(Guid id, UpdateObjectiveDto request)
    {
        var objective = await _dbContext.Objectives.FindAsync(id);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (!Enum.TryParse<ObjectiveStatus>(request.Status, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid status value. Valid values are: Todo, InProgress, Completed." });
        }

        _mapper.Map(request, objective);
        objective.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Objective {ObjectiveId} updated", objective.Id);

        return await GetObjectiveByIdAsync(id);
    }

    public async Task<IActionResult> DeleteObjectiveAsync(Guid id)
    {
        var objective = await _dbContext.Objectives.FindAsync(id);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        _dbContext.Objectives.Remove(objective);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Objective {ObjectiveId} deleted", id);

        return new OkObjectResult(new { Message = "Objective deleted successfully." });
    }

    public async Task<IActionResult> UpdateObjectiveStatusAsync(Guid id, string status)
    {
        var objective = await _dbContext.Objectives.FindAsync(id);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        if (!Enum.TryParse<ObjectiveStatus>(status, true, out var objectiveStatus))
        {
            var validStatuses = string.Join(", ", Enum.GetNames<ObjectiveStatus>());
            return new BadRequestObjectResult(new { Error = $"Invalid status '{status}'. Valid statuses are: {validStatuses}" });
        }

        objective.Status = objectiveStatus;
        objective.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Objective {ObjectiveId} status updated to {Status}", id, status);

        return new OkObjectResult(new { Message = $"Objective status updated to {objectiveStatus}." });
    }

    #endregion

    #region Objective Team Member Operations

    public async Task<IActionResult> AssignTeamMemberToObjectiveAsync(Guid objectiveId, AssignObjectiveTeamMemberDto request)
    {
        var objective = await _dbContext.Objectives.FindAsync(objectiveId);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        var user = await _dbContext.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        // Check if user is a member of the project, if not, add them automatically
        var isProjectMember = await _dbContext.ProjectTeamMembers
            .AnyAsync(tm => tm.ProjectId == objective.ProjectId && tm.UserId == request.UserId);

        if (!isProjectMember)
        {
            var projectTeamMember = new ProjectTeamMember
            {
                Id = Guid.NewGuid(),
                ProjectId = objective.ProjectId,
                UserId = request.UserId,
                Role = "Member",
                JoinedAt = DateTime.UtcNow
            };
            _dbContext.ProjectTeamMembers.Add(projectTeamMember);
            _logger.LogInformation("User {UserId} automatically added to project {ProjectId} when assigned to objective", request.UserId, objective.ProjectId);
        }

        var existingMember = await _dbContext.ObjectiveTeamMembers
            .FirstOrDefaultAsync(tm => tm.ObjectiveId == objectiveId && tm.UserId == request.UserId);

        if (existingMember != null)
        {
            return new BadRequestObjectResult(new { Error = "User is already assigned to this objective." });
        }

        var teamMember = new ObjectiveTeamMember
        {
            Id = Guid.NewGuid(),
            ObjectiveId = objectiveId,
            UserId = request.UserId,
            AssignedAt = DateTime.UtcNow
        };

        _dbContext.ObjectiveTeamMembers.Add(teamMember);
        await _dbContext.SaveChangesAsync();

        teamMember.User = user;

        _logger.LogInformation("User {UserId} assigned to objective {ObjectiveId}", request.UserId, objectiveId);

        return new OkObjectResult(_mapper.Map<TeamMemberDto>(teamMember));
    }

    public async Task<IActionResult> RemoveTeamMemberFromObjectiveAsync(Guid objectiveId, string userId)
    {
        var teamMember = await _dbContext.ObjectiveTeamMembers
            .FirstOrDefaultAsync(tm => tm.ObjectiveId == objectiveId && tm.UserId == userId);

        if (teamMember == null)
        {
            return new NotFoundObjectResult(new { Error = "Team member not found in this objective." });
        }

        _dbContext.ObjectiveTeamMembers.Remove(teamMember);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User {UserId} removed from objective {ObjectiveId}", userId, objectiveId);

        return new OkObjectResult(new { Message = "Team member removed from objective successfully." });
    }

    public async Task<IActionResult> GetObjectiveTeamMembersAsync(Guid objectiveId)
    {
        var objective = await _dbContext.Objectives.FindAsync(objectiveId);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        var teamMembers = await _dbContext.ObjectiveTeamMembers
            .Include(tm => tm.User)
            .Where(tm => tm.ObjectiveId == objectiveId)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<TeamMemberDto>>(teamMembers));
    }

    public async Task<IActionResult> JoinObjectiveAsync(Guid objectiveId, string userId)
    {
        var objective = await _dbContext.Objectives
            .Include(o => o.Project)
            .FirstOrDefaultAsync(o => o.Id == objectiveId);

        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        if (objective.Status == ObjectiveStatus.Completed)
        {
            return new BadRequestObjectResult(new { Error = "Cannot join a completed objective." });
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        // Check if user is a member of the project, if not, add them automatically
        var isProjectMember = await _dbContext.ProjectTeamMembers
            .AnyAsync(tm => tm.ProjectId == objective.ProjectId && tm.UserId == userId);

        if (!isProjectMember)
        {
            var projectTeamMember = new ProjectTeamMember
            {
                Id = Guid.NewGuid(),
                ProjectId = objective.ProjectId,
                UserId = userId,
                Role = "Member",
                JoinedAt = DateTime.UtcNow
            };
            _dbContext.ProjectTeamMembers.Add(projectTeamMember);
            _logger.LogInformation("User {UserId} automatically added to project {ProjectId} when joining objective", userId, objective.ProjectId);
        }

        var existingMember = await _dbContext.ObjectiveTeamMembers
            .FirstOrDefaultAsync(tm => tm.ObjectiveId == objectiveId && tm.UserId == userId);

        if (existingMember != null)
        {
            return new BadRequestObjectResult(new { Error = "You are already a member of this objective." });
        }

        var teamMember = new ObjectiveTeamMember
        {
            Id = Guid.NewGuid(),
            ObjectiveId = objectiveId,
            UserId = userId,
            AssignedAt = DateTime.UtcNow
        };

        _dbContext.ObjectiveTeamMembers.Add(teamMember);
        await _dbContext.SaveChangesAsync();

        teamMember.User = user;

        _logger.LogInformation("User {UserId} joined objective {ObjectiveId}", userId, objectiveId);

        return new OkObjectResult(_mapper.Map<TeamMemberDto>(teamMember));
    }

    public async Task<IActionResult> LeaveObjectiveAsync(Guid objectiveId, string userId)
    {
        var objective = await _dbContext.Objectives.FindAsync(objectiveId);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        if (objective.Status == ObjectiveStatus.Completed)
        {
            return new BadRequestObjectResult(new { Error = "Cannot leave a completed objective." });
        }

        var teamMember = await _dbContext.ObjectiveTeamMembers
            .FirstOrDefaultAsync(tm => tm.ObjectiveId == objectiveId && tm.UserId == userId);

        if (teamMember == null)
        {
            return new NotFoundObjectResult(new { Error = "You are not a member of this objective." });
        }

        _dbContext.ObjectiveTeamMembers.Remove(teamMember);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("User {UserId} left objective {ObjectiveId}", userId, objectiveId);

        return new OkObjectResult(new { Message = "You have left the objective successfully." });
    }

    #endregion

    #region Resource Operations

    public async Task<IActionResult> CreateResourceAsync(CreateResourceDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return new BadRequestObjectResult(new { Error = "URL is required." });
        }

        if (!Enum.TryParse<ResourceType>(request.Type, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid resource type. Valid values are: Documentation, Tutorial, Tool, Reference, Other." });
        }

        if (request.ProjectId == null && request.ObjectiveId == null)
        {
            return new BadRequestObjectResult(new { Error = "Resource must belong to either a project or an objective." });
        }

        if (request.ProjectId != null && request.ObjectiveId != null)
        {
            return new BadRequestObjectResult(new { Error = "Resource cannot belong to both a project and an objective." });
        }

        if (request.ProjectId != null)
        {
            var project = await _dbContext.Projects.FindAsync(request.ProjectId);
            if (project == null)
            {
                return new NotFoundObjectResult(new { Error = "Project not found." });
            }
        }

        if (request.ObjectiveId != null)
        {
            var objective = await _dbContext.Objectives.FindAsync(request.ObjectiveId);
            if (objective == null)
            {
                return new NotFoundObjectResult(new { Error = "Objective not found." });
            }
        }

        var resource = _mapper.Map<Resource>(request);
        resource.Id = Guid.NewGuid();
        resource.CreatedAt = DateTime.UtcNow;

        _dbContext.Resources.Add(resource);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Resource {ResourceId} created", resource.Id);

        return new OkObjectResult(_mapper.Map<ResourceDto>(resource));
    }

    public async Task<IActionResult> GetResourceByIdAsync(Guid id)
    {
        var resource = await _dbContext.Resources.FindAsync(id);
        if (resource == null)
        {
            return new NotFoundObjectResult(new { Error = "Resource not found." });
        }

        return new OkObjectResult(_mapper.Map<ResourceDto>(resource));
    }

    public async Task<IActionResult> GetResourcesByProjectIdAsync(Guid projectId)
    {
        var project = await _dbContext.Projects.FindAsync(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new { Error = "Project not found." });
        }

        var resources = await _dbContext.Resources
            .Where(r => r.ProjectId == projectId)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<ResourceDto>>(resources));
    }

    public async Task<IActionResult> GetResourcesByObjectiveIdAsync(Guid objectiveId)
    {
        var objective = await _dbContext.Objectives.FindAsync(objectiveId);
        if (objective == null)
        {
            return new NotFoundObjectResult(new { Error = "Objective not found." });
        }

        var resources = await _dbContext.Resources
            .Where(r => r.ObjectiveId == objectiveId)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<ResourceDto>>(resources));
    }

    public async Task<IActionResult> UpdateResourceAsync(Guid id, UpdateResourceDto request)
    {
        var resource = await _dbContext.Resources.FindAsync(id);
        if (resource == null)
        {
            return new NotFoundObjectResult(new { Error = "Resource not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return new BadRequestObjectResult(new { Error = "URL is required." });
        }

        if (!Enum.TryParse<ResourceType>(request.Type, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid resource type. Valid values are: Documentation, Tutorial, Tool, Reference, Other." });
        }

        _mapper.Map(request, resource);
        resource.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Resource {ResourceId} updated", resource.Id);

        return new OkObjectResult(_mapper.Map<ResourceDto>(resource));
    }

    public async Task<IActionResult> DeleteResourceAsync(Guid id)
    {
        var resource = await _dbContext.Resources.FindAsync(id);
        if (resource == null)
        {
            return new NotFoundObjectResult(new { Error = "Resource not found." });
        }

        _dbContext.Resources.Remove(resource);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Resource {ResourceId} deleted", id);

        return new OkObjectResult(new { Message = "Resource deleted successfully." });
    }

    #endregion

    #region Seed and Cleanup Operations

    public async Task<IActionResult> SeedProjectsAsync(string userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        var projects = new List<Project>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "FLOSSK Website Redesign",
                Description = "Complete redesign and modernization of the FLOSSK organization website with improved UX and accessibility.",
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow.AddDays(60),
                Status = ProjectStatus.InProgress,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Open Source Workshop Series",
                Description = "A series of workshops introducing students to open source contribution, Git, and collaborative development.",
                StartDate = DateTime.UtcNow.AddDays(14),
                EndDate = DateTime.UtcNow.AddDays(90),
                Status = ProjectStatus.Upcoming,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Community Hackathon 2025",
                Description = "Annual hackathon event bringing together developers, designers, and innovators to build solutions for local challenges.",
                StartDate = DateTime.UtcNow.AddDays(-90),
                EndDate = DateTime.UtcNow.AddDays(-60),
                Status = ProjectStatus.Completed,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = userId
            }
        };

        _dbContext.Projects.AddRange(projects);
        await _dbContext.SaveChangesAsync();

        // Add objectives for each project
        var objectives = new List<Objective>
        {
            // Website Redesign objectives
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Design System Creation",
                Description = "Create a comprehensive design system with reusable components and style guidelines.",
                Status = ObjectiveStatus.Completed,
                ProjectId = projects[0].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Frontend Development",
                Description = "Implement the new design using modern frontend technologies (Angular/React).",
                Status = ObjectiveStatus.InProgress,
                ProjectId = projects[0].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Backend API Integration",
                Description = "Connect the frontend to the existing backend APIs and implement new endpoints.",
                Status = ObjectiveStatus.InProgress,
                ProjectId = projects[0].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Testing & QA",
                Description = "Comprehensive testing including unit tests, integration tests, and user acceptance testing.",
                Status = ObjectiveStatus.Todo,
                ProjectId = projects[0].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },

            // Workshop Series objectives
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Curriculum Development",
                Description = "Develop workshop materials, slides, and hands-on exercises for each session.",
                Status = ObjectiveStatus.InProgress,
                ProjectId = projects[1].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Venue & Logistics",
                Description = "Secure venues, equipment, and handle registration for all workshop sessions.",
                Status = ObjectiveStatus.Todo,
                ProjectId = projects[1].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Speaker Recruitment",
                Description = "Identify and recruit experienced open source contributors as guest speakers.",
                Status = ObjectiveStatus.InProgress,
                ProjectId = projects[1].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },

            // Hackathon objectives (all completed)
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Event Planning",
                Description = "Plan the hackathon schedule, themes, and judging criteria.",
                Status = ObjectiveStatus.Completed,
                ProjectId = projects[2].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Sponsor Acquisition",
                Description = "Reach out to potential sponsors and secure funding for prizes and refreshments.",
                Status = ObjectiveStatus.Completed,
                ProjectId = projects[2].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Post-Event Documentation",
                Description = "Document winning projects, participant feedback, and lessons learned.",
                Status = ObjectiveStatus.Completed,
                ProjectId = projects[2].Id,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            }
        };

        _dbContext.Objectives.AddRange(objectives);
        await _dbContext.SaveChangesAsync();

        // Add some resources
        var resources = new List<Resource>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Figma Design Files",
                Url = "https://figma.com/file/flossk-redesign",
                Description = "Main design files for the website redesign project.",
                Type = ResourceType.Tool,
                ProjectId = projects[0].Id,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Angular Documentation",
                Url = "https://angular.io/docs",
                Description = "Official Angular documentation for frontend development.",
                Type = ResourceType.Documentation,
                ProjectId = projects[0].Id,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Git Tutorial for Beginners",
                Url = "https://git-scm.com/book/en/v2",
                Description = "Pro Git book - comprehensive guide to Git.",
                Type = ResourceType.Tutorial,
                ProjectId = projects[1].Id,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Title = "Open Source Guide",
                Url = "https://opensource.guide/",
                Description = "GitHub's guide to open source contribution.",
                Type = ResourceType.Reference,
                ProjectId = projects[1].Id,
                CreatedAt = DateTime.UtcNow
            }
        };

        _dbContext.Resources.AddRange(resources);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Seeded {ProjectCount} projects with {ObjectiveCount} objectives and {ResourceCount} resources",
            projects.Count, objectives.Count, resources.Count);

        return new OkObjectResult(new
        {
            Message = "Projects seeded successfully.",
            ProjectsCreated = projects.Count,
            ObjectivesCreated = objectives.Count,
            ResourcesCreated = resources.Count
        });
    }

    public async Task<IActionResult> DeleteAllProjectsAsync()
    {
        // Delete in correct order due to foreign key constraints
        var resourceCount = await _dbContext.Resources.CountAsync();
        var objectiveTeamMemberCount = await _dbContext.ObjectiveTeamMembers.CountAsync();
        var objectiveCount = await _dbContext.Objectives.CountAsync();
        var projectTeamMemberCount = await _dbContext.ProjectTeamMembers.CountAsync();
        var projectCount = await _dbContext.Projects.CountAsync();

        _dbContext.Resources.RemoveRange(_dbContext.Resources);
        _dbContext.ObjectiveTeamMembers.RemoveRange(_dbContext.ObjectiveTeamMembers);
        _dbContext.Objectives.RemoveRange(_dbContext.Objectives);
        _dbContext.ProjectTeamMembers.RemoveRange(_dbContext.ProjectTeamMembers);
        _dbContext.Projects.RemoveRange(_dbContext.Projects);

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Deleted all projects: {Projects} projects, {Objectives} objectives, {Resources} resources, {ProjectMembers} project members, {ObjectiveMembers} objective members",
            projectCount, objectiveCount, resourceCount, projectTeamMemberCount, objectiveTeamMemberCount);

        return new OkObjectResult(new
        {
            Message = "All projects and related data deleted successfully.",
            ProjectsDeleted = projectCount,
            ObjectivesDeleted = objectiveCount,
            ResourcesDeleted = resourceCount,
            ProjectTeamMembersDeleted = projectTeamMemberCount,
            ObjectiveTeamMembersDeleted = objectiveTeamMemberCount
        });
    }

    #endregion
}
