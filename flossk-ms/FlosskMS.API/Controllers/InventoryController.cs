using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryController(IInventoryService inventoryService) : ControllerBase
{
    private readonly IInventoryService _inventoryService = inventoryService;

    #region Inventory Item Endpoints

    /// <summary>
    /// Get all inventory items with optional filters
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <param name="category">Filter by category: Electronic, Tool, Components, Furniture, Hardware, OfficeSupplies</param>
    /// <param name="status">Filter by status: Free, InUse</param>
    /// <param name="search">Search by name or description</param>
    [HttpGet]
    public async Task<IActionResult> GetAllInventoryItems(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        return await _inventoryService.GetAllInventoryItemsAsync(page, pageSize, category, status, search);
    }

    /// <summary>
    /// Get an inventory item by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetInventoryItem(Guid id)
    {
        return await _inventoryService.GetInventoryItemByIdAsync(id);
    }

    /// <summary>
    /// Get inventory items currently checked out by a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetInventoryItemsByUser(string userId)
    {
        return await _inventoryService.GetInventoryItemsByUserAsync(userId);
    }

    /// <summary>
    /// Get inventory items currently checked out by the logged-in user
    /// </summary>
    [HttpGet("my-items")]
    public async Task<IActionResult> GetMyInventoryItems()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _inventoryService.GetInventoryItemsByUserAsync(userId);
    }

    /// <summary>
    /// Create a new inventory item (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateInventoryItem([FromBody] CreateInventoryItemDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _inventoryService.CreateInventoryItemAsync(request, userId);
    }

    /// <summary>
    /// Update an inventory item (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateInventoryItem(Guid id, [FromBody] UpdateInventoryItemDto request)
    {
        return await _inventoryService.UpdateInventoryItemAsync(id, request);
    }

    /// <summary>
    /// Delete an inventory item (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteInventoryItem(Guid id)
    {
        return await _inventoryService.DeleteInventoryItemAsync(id);
    }

    /// <summary>
    /// Seed sample inventory items to the database (Admin only)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost("seed")]
    public async Task<IActionResult> SeedInventoryItems()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _inventoryService.SeedInventoryItemsAsync(userId);
    }

    #endregion

    #region Check In/Out Endpoints

    /// <summary>
    /// Check out an inventory item (current user)
    /// </summary>
    [HttpPost("{id:guid}/checkout")]
    public async Task<IActionResult> CheckOutInventoryItem(Guid id, [FromBody] CheckOutInventoryItemDto? request = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _inventoryService.CheckOutInventoryItemAsync(id, userId, request);
    }

    /// <summary>
    /// Check in an inventory item (current user)
    /// </summary>
    [HttpPost("{id:guid}/checkin")]
    public async Task<IActionResult> CheckInInventoryItem(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _inventoryService.CheckInInventoryItemAsync(id, userId);
    }

    #endregion

    #region Image Management Endpoints

    /// <summary>
    /// Add an image to an inventory item (Admin only)
    /// </summary>
    /// <param name="id">Inventory item ID</param>
    /// <param name="fileId">Uploaded file ID</param>
    [Authorize(Roles = "Admin")]
    [HttpPost("{id:guid}/images/{fileId:guid}")]
    public async Task<IActionResult> AddImageToInventoryItem(Guid id, Guid fileId)
    {
        return await _inventoryService.AddImageToInventoryItemAsync(id, fileId);
    }

    /// <summary>
    /// Remove an image from an inventory item (Admin only)
    /// </summary>
    /// <param name="id">Inventory item ID</param>
    /// <param name="imageId">Image ID</param>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> RemoveImageFromInventoryItem(Guid id, Guid imageId)
    {
        return await _inventoryService.RemoveImageFromInventoryItemAsync(id, imageId);
    }

    #endregion
}
