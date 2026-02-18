using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IInventoryService
{
    Task<IActionResult> GetAllInventoryItemsAsync(int page = 1, int pageSize = 20, string? category = null, string? status = null, string? search = null);
    Task<IActionResult> GetInventoryItemByIdAsync(Guid id);
    Task<IActionResult> GetInventoryItemsByUserAsync(string userId);
    Task<IActionResult> CreateInventoryItemAsync(CreateInventoryItemDto dto, string createdByUserId);
    Task<IActionResult> UpdateInventoryItemAsync(Guid id, UpdateInventoryItemDto dto);
    Task<IActionResult> DeleteInventoryItemAsync(Guid id);
    Task<IActionResult> CheckOutInventoryItemAsync(Guid id, string userId, CheckOutInventoryItemDto? dto = null);
    Task<IActionResult> CheckInInventoryItemAsync(Guid id, string userId);
    Task<IActionResult> AddImageToInventoryItemAsync(Guid id, Guid fileId);
    Task<IActionResult> RemoveImageFromInventoryItemAsync(Guid id, Guid imageId);
    Task<IActionResult> SeedInventoryItemsAsync(string createdByUserId);
    Task<IActionResult> DeleteAllInventoryItemsAsync();
}
