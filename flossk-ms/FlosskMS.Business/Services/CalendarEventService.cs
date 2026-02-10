using FlosskMS.Business.DTOs;
using FlosskMS.Data;
using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlosskMS.Business.Services;

public class CalendarEventService : ICalendarEventService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<CalendarEventService> _logger;

    public CalendarEventService(
        ApplicationDbContext dbContext,
        ILogger<CalendarEventService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IActionResult> GetCalendarEventAsync()
    {
        var calendarEvent = await _dbContext.CalendarEvents
            .Include(c => c.CreatedByUser)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync();

        if (calendarEvent == null)
        {
            return new OkObjectResult((CalendarEventDto?)null);
        }

        return new OkObjectResult(MapToDto(calendarEvent));
    }

    public async Task<IActionResult> CreateCalendarEventAsync(CreateCalendarEventDto request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.CalendarUrl))
        {
            return new BadRequestObjectResult(new { Error = "Calendar URL is required." });
        }

        // Check if a calendar already exists
        var existingCalendar = await _dbContext.CalendarEvents.FirstOrDefaultAsync();
        if (existingCalendar != null)
        {
            return new BadRequestObjectResult(new { Error = "A calendar already exists. Please delete it first before adding a new one." });
        }

        var user = await _dbContext.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Error = "User not found." });
        }

        var calendarEvent = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            CalendarUrl = request.CalendarUrl,
            Title = request.Title,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId,
            CreatedByUser = user
        };

        _dbContext.CalendarEvents.Add(calendarEvent);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Calendar event {CalendarEventId} created by user {UserId}", calendarEvent.Id, userId);

        return new OkObjectResult(MapToDto(calendarEvent));
    }

    public async Task<IActionResult> UpdateCalendarEventAsync(Guid id, UpdateCalendarEventDto request, string userId)
    {
        if (string.IsNullOrWhiteSpace(request.CalendarUrl))
        {
            return new BadRequestObjectResult(new { Error = "Calendar URL is required." });
        }

        var calendarEvent = await _dbContext.CalendarEvents
            .Include(c => c.CreatedByUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (calendarEvent == null)
        {
            return new NotFoundObjectResult(new { Error = "Calendar event not found." });
        }

        calendarEvent.CalendarUrl = request.CalendarUrl;
        calendarEvent.Title = request.Title;

        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Calendar event {CalendarEventId} updated by user {UserId}", calendarEvent.Id, userId);

        return new OkObjectResult(MapToDto(calendarEvent));
    }

    public async Task<IActionResult> DeleteCalendarEventAsync(Guid id, string userId)
    {
        var calendarEvent = await _dbContext.CalendarEvents.FindAsync(id);

        if (calendarEvent == null)
        {
            return new NotFoundObjectResult(new { Error = "Calendar event not found." });
        }

        _dbContext.CalendarEvents.Remove(calendarEvent);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Calendar event {CalendarEventId} deleted by user {UserId}", calendarEvent.Id, userId);

        return new OkObjectResult(new { Message = "Calendar event deleted successfully." });
    }

    private static CalendarEventDto MapToDto(CalendarEvent calendarEvent)
    {
        return new CalendarEventDto
        {
            Id = calendarEvent.Id,
            CalendarUrl = calendarEvent.CalendarUrl,
            Title = calendarEvent.Title,
            CreatedAt = calendarEvent.CreatedAt,
            CreatedByUserId = calendarEvent.CreatedByUserId,
            CreatedByFirstName = calendarEvent.CreatedByUser?.FirstName ?? string.Empty,
            CreatedByLastName = calendarEvent.CreatedByUser?.LastName ?? string.Empty
        };
    }
}
