using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface ICalendarEventService
{
    Task<IActionResult> GetCalendarEventAsync();
    Task<IActionResult> CreateCalendarEventAsync(CreateCalendarEventDto request, string userId);
    Task<IActionResult> UpdateCalendarEventAsync(Guid id, UpdateCalendarEventDto request, string userId);
    Task<IActionResult> DeleteCalendarEventAsync(Guid id, string userId);
}
