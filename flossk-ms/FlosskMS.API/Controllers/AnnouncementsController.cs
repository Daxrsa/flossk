using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnnouncementsController(IAnnouncementService announcementService) : ControllerBase
{
    private readonly IAnnouncementService _announcementService = announcementService;

    /// <summary>
    /// Create a new announcement (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _announcementService.CreateAnnouncementAsync(request, userId);
    }

    /// <summary>
    /// Get all announcements with optional filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAnnouncements(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? category = null,
        [FromQuery] string? importance = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _announcementService.GetAnnouncementsAsync(page, pageSize, category, importance, userId);
    }

    /// <summary>
    /// Get a specific announcement by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetAnnouncementById(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _announcementService.GetAnnouncementByIdAsync(id, userId);
    }

    /// <summary>
    /// Delete an announcement (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAnnouncement(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _announcementService.DeleteAnnouncementAsync(id, userId);
    }

    /// <summary>
    /// Update an announcement (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] UpdateAnnouncementDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _announcementService.UpdateAnnouncementAsync(id, request, userId);
    }

    /// <summary>
    /// Increment the view count of an announcement
    /// </summary>
    [HttpPost("{id:guid}/view")]
    public async Task<IActionResult> IncrementViewCount(Guid id)
    {
        return await _announcementService.IncrementViewCountAsync(id);
    }

    /// <summary>
    /// Add or toggle a reaction to an announcement
    /// </summary>
    [HttpPost("{id:guid}/reactions")]
    public async Task<IActionResult> AddReaction(Guid id, [FromBody] AddReactionDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _announcementService.AddReactionAsync(id, request, userId);
    }

    /// <summary>
    /// Remove a reaction from an announcement
    /// </summary>
    [HttpDelete("{id:guid}/reactions/{emoji}")]
    public async Task<IActionResult> RemoveReaction(Guid id, string emoji)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _announcementService.RemoveReactionAsync(id, emoji, userId);
    }

    /// <summary>
    /// Get all reactions for an announcement
    /// </summary>
    [HttpGet("{id:guid}/reactions")]
    public async Task<IActionResult> GetReactions(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return await _announcementService.GetReactionsAsync(id, userId);
    }
}
