using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EventsController(ICalendarEventService calendarEventService) : ControllerBase
{
    private readonly ICalendarEventService _calendarEventService = calendarEventService;

    /// <summary>
    /// Get the current calendar event (available to all authenticated users)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCalendarEvent()
    {
        return await _calendarEventService.GetCalendarEventAsync();
    }

    /// <summary>
    /// Create a new calendar event (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateCalendarEvent([FromBody] CreateCalendarEventDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _calendarEventService.CreateCalendarEventAsync(request, userId);
    }

    /// <summary>
    /// Update an existing calendar event (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCalendarEvent(Guid id, [FromBody] UpdateCalendarEventDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _calendarEventService.UpdateCalendarEventAsync(id, request, userId);
    }

    /// <summary>
    /// Delete a calendar event (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCalendarEvent(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _calendarEventService.DeleteCalendarEventAsync(id, userId);
    }
}
