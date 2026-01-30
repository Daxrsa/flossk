using AutoMapper;
using FlosskMS.Business.DTOs;
using FlosskMS.Data;
using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlosskMS.Business.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ILogger<AnnouncementService> _logger;

    public AnnouncementService(
        ApplicationDbContext dbContext,
        IMapper mapper,
        ILogger<AnnouncementService> logger)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IActionResult> CreateAnnouncementAsync(CreateAnnouncementDto request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return new BadRequestObjectResult(new { Error = "Body is required." });
        }

        if (!Enum.TryParse<AnnouncementImportance>(request.Importance, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid importance value. Valid values are: Normal, Medium, High, Urgent." });
        }

        if (!Enum.TryParse<AnnouncementCategory>(request.Category, true, out _))
        {
            return new BadRequestObjectResult(new { Error = "Invalid category value. Valid values are: General, Events, Updates, Maintenance, Meetings." });
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        var announcement = _mapper.Map<Announcement>(request);
        announcement.Id = Guid.NewGuid();
        announcement.CreatedAt = DateTime.UtcNow;
        announcement.CreatedByUserId = userId;
        announcement.ViewCount = 0;

        _dbContext.Announcements.Add(announcement);
        await _dbContext.SaveChangesAsync();

        // Reload with user for mapping
        announcement.CreatedByUser = user;

        _logger.LogInformation("Announcement {AnnouncementId} created by user {UserId}", announcement.Id, userId);

        return new OkObjectResult(_mapper.Map<AnnouncementDto>(announcement));
    }

    public async Task<IActionResult> GetAnnouncementsAsync(int page = 1, int pageSize = 10, string? category = null, string? importance = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _dbContext.Announcements
            .Include(a => a.CreatedByUser)
            .AsQueryable();

        // Filter by category
        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<AnnouncementCategory>(category, true, out var categoryEnum))
        {
            query = query.Where(a => a.Category == categoryEnum);
        }

        // Filter by importance
        if (!string.IsNullOrWhiteSpace(importance) && Enum.TryParse<AnnouncementImportance>(importance, true, out var importanceEnum))
        {
            query = query.Where(a => a.Importance == importanceEnum);
        }

        var totalCount = await query.CountAsync();

        var announcements = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new AnnouncementListDto
        {
            Announcements = _mapper.Map<List<AnnouncementDto>>(announcements),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return new OkObjectResult(result);
    }

    public async Task<IActionResult> GetAnnouncementByIdAsync(Guid id)
    {
        var announcement = await _dbContext.Announcements
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (announcement == null)
        {
            return new NotFoundObjectResult(new { Error = "Announcement not found." });
        }

        return new OkObjectResult(_mapper.Map<AnnouncementDto>(announcement));
    }

    public async Task<IActionResult> DeleteAnnouncementAsync(Guid id, string userId)
    {
        var announcement = await _dbContext.Announcements.FindAsync(id);

        if (announcement == null)
        {
            return new NotFoundObjectResult(new { Error = "Announcement not found." });
        }

        _dbContext.Announcements.Remove(announcement);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Announcement {AnnouncementId} deleted by user {UserId}", id, userId);

        return new OkObjectResult(new { Message = "Announcement deleted successfully." });
    }

    public async Task<IActionResult> UpdateAnnouncementAsync(Guid id, UpdateAnnouncementDto request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return new BadRequestObjectResult(new { Error = "Title is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Body))
        {
            return new BadRequestObjectResult(new { Error = "Body is required." });
        }

        if (!Enum.TryParse<AnnouncementImportance>(request.Importance, true, out var importance))
        {
            return new BadRequestObjectResult(new { Error = "Invalid importance value. Valid values are: Normal, Medium, High, Urgent." });
        }

        if (!Enum.TryParse<AnnouncementCategory>(request.Category, true, out var category))
        {
            return new BadRequestObjectResult(new { Error = "Invalid category value. Valid values are: General, Events, Updates, Maintenance, Meetings." });
        }

        var announcement = await _dbContext.Announcements
            .Include(a => a.CreatedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (announcement == null)
        {
            return new NotFoundObjectResult(new { Error = "Announcement not found." });
        }

        announcement.Title = request.Title;
        announcement.Body = request.Body;
        announcement.Importance = importance;
        announcement.Category = category;
        announcement.IsEdited = true;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Announcement {AnnouncementId} updated by user {UserId}", id, userId);

        return new OkObjectResult(_mapper.Map<AnnouncementDto>(announcement));
    }

    public async Task<IActionResult> IncrementViewCountAsync(Guid id)
    {
        var announcement = await _dbContext.Announcements.FindAsync(id);

        if (announcement == null)
        {
            return new NotFoundObjectResult(new { Error = "Announcement not found." });
        }

        announcement.ViewCount++;
        await _dbContext.SaveChangesAsync();

        return new OkObjectResult(new { ViewCount = announcement.ViewCount });
    }
}
