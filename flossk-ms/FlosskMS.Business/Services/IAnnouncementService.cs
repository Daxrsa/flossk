using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IAnnouncementService
{
    Task<IActionResult> CreateAnnouncementAsync(CreateAnnouncementDto request, string userId);
    Task<IActionResult> UpdateAnnouncementAsync(Guid id, UpdateAnnouncementDto request, string userId);
    Task<IActionResult> GetAnnouncementsAsync(int page = 1, int pageSize = 10, string? category = null, string? importance = null, string? currentUserId = null);
    Task<IActionResult> GetAnnouncementByIdAsync(Guid id, string? currentUserId = null);
    Task<IActionResult> DeleteAnnouncementAsync(Guid id, string userId);
    Task<IActionResult> IncrementViewCountAsync(Guid id, string userId);
    Task<IActionResult> GetViewCountAsync(Guid id);
    
    // Reaction methods
    Task<IActionResult> AddReactionAsync(Guid announcementId, AddReactionDto request, string userId);
    Task<IActionResult> RemoveReactionAsync(Guid announcementId, string emoji, string userId);
    Task<IActionResult> GetReactionsAsync(Guid announcementId, string? currentUserId = null);
}
