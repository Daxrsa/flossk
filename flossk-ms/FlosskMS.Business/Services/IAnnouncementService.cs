using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IAnnouncementService
{
    Task<IActionResult> CreateAnnouncementAsync(CreateAnnouncementDto request, string userId);
    Task<IActionResult> UpdateAnnouncementAsync(Guid id, UpdateAnnouncementDto request, string userId);
    Task<IActionResult> GetAnnouncementsAsync(int page = 1, int pageSize = 10, string? category = null, string? importance = null);
    Task<IActionResult> GetAnnouncementByIdAsync(Guid id);
    Task<IActionResult> DeleteAnnouncementAsync(Guid id, string userId);
    Task<IActionResult> IncrementViewCountAsync(Guid id);
}
