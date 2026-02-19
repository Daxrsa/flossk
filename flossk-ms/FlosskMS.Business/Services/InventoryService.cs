using AutoMapper;
using FlosskMS.Business.DTOs;
using FlosskMS.Data;
using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlosskMS.Business.Services;

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public InventoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IActionResult> GetAllInventoryItemsAsync(int page = 1, int pageSize = 20, string? category = null, string? status = null, string? search = null)
    {
        var query = _context.InventoryItems
            .Include(i => i.CurrentUser)
            .Include(i => i.CreatedByUser)
            .Include(i => i.Images)
                .ThenInclude(img => img.UploadedFile)
            .AsQueryable();

        // Filter by category
        if (!string.IsNullOrEmpty(category) && Enum.TryParse<InventoryCategory>(category, true, out var categoryEnum))
        {
            query = query.Where(i => i.Category == categoryEnum);
        }

        // Filter by status
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<InventoryStatus>(status, true, out var statusEnum))
        {
            query = query.Where(i => i.Status == statusEnum);
        }

        // Search by name or description
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i => i.Name.Contains(search) || (i.Description != null && i.Description.Contains(search)));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new OkObjectResult(new
        {
            Data = _mapper.Map<List<InventoryItemListDto>>(items),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    public async Task<IActionResult> GetInventoryItemByIdAsync(Guid id)
    {
        var item = await GetItemWithIncludesAsync(id);

        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        return new OkObjectResult(_mapper.Map<InventoryItemDto>(item));
    }

    public async Task<IActionResult> GetInventoryItemsByUserAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Message = "User not found." });
        }

        var items = await _context.InventoryItems
            .Include(i => i.CurrentUser)
            .Include(i => i.CreatedByUser)
            .Include(i => i.Images)
                .ThenInclude(img => img.UploadedFile)
            .Where(i => i.CurrentUserId == userId && i.Status == InventoryStatus.InUse)
            .OrderByDescending(i => i.CheckedOutAt)
            .ToListAsync();

        return new OkObjectResult(_mapper.Map<List<InventoryItemDto>>(items));
    }

    public async Task<IActionResult> CreateInventoryItemAsync(CreateInventoryItemDto dto, string createdByUserId)
    {
        // Validate category
        if (!Enum.TryParse<InventoryCategory>(dto.Category, true, out var category))
        {
            return new BadRequestObjectResult(new { Message = "Invalid category. Valid values are: Electronic, Tool, Components, Furniture, Hardware, OfficeSupplies." });
        }

        var user = await _context.Users.FindAsync(createdByUserId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Message = "Creator user not found." });
        }

        var item = new InventoryItem
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Category = category,
            Quantity = dto.Quantity,
            Description = dto.Description,
            Status = InventoryStatus.Free,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.InventoryItems.Add(item);

        // Add images if provided
        if (dto.ImageFileIds != null && dto.ImageFileIds.Count > 0)
        {
            foreach (var fileId in dto.ImageFileIds)
            {
                var file = await _context.UploadedFiles.FindAsync(fileId);
                if (file != null)
                {
                    var image = new InventoryItemImage
                    {
                        Id = Guid.NewGuid(),
                        InventoryItemId = item.Id,
                        UploadedFileId = fileId,
                        AddedAt = DateTime.UtcNow
                    };
                    _context.InventoryItemImages.Add(image);
                }
            }
        }

        await _context.SaveChangesAsync();

        // Reload with includes
        var createdItem = await GetItemWithIncludesAsync(item.Id);
        return new OkObjectResult(new { Message = "Inventory item created successfully.", Data = _mapper.Map<InventoryItemDto>(createdItem) });
    }

    public async Task<IActionResult> UpdateInventoryItemAsync(Guid id, UpdateInventoryItemDto dto)
    {
        var item = await _context.InventoryItems.FindAsync(id);

        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        // Update fields if provided
        if (!string.IsNullOrEmpty(dto.Name))
        {
            item.Name = dto.Name;
        }

        if (!string.IsNullOrEmpty(dto.Category))
        {
            if (!Enum.TryParse<InventoryCategory>(dto.Category, true, out var category))
            {
                return new BadRequestObjectResult(new { Message = "Invalid category. Valid values are: Electronic, Tool, Components, Furniture, Hardware, OfficeSupplies." });
            }
            item.Category = category;
        }

        if (dto.Quantity.HasValue)
        {
            item.Quantity = dto.Quantity.Value;
        }

        if (dto.Description != null)
        {
            item.Description = dto.Description;
        }

        item.UpdatedAt = DateTime.UtcNow;

        // Update images if provided
        if (dto.ImageFileIds != null)
        {
            // Remove existing images
            var existingImages = await _context.InventoryItemImages
                .Where(img => img.InventoryItemId == id)
                .ToListAsync();
            _context.InventoryItemImages.RemoveRange(existingImages);

            // Add new images
            foreach (var fileId in dto.ImageFileIds)
            {
                var file = await _context.UploadedFiles.FindAsync(fileId);
                if (file != null)
                {
                    var image = new InventoryItemImage
                    {
                        Id = Guid.NewGuid(),
                        InventoryItemId = item.Id,
                        UploadedFileId = fileId,
                        AddedAt = DateTime.UtcNow
                    };
                    _context.InventoryItemImages.Add(image);
                }
            }
        }

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedItem = await GetItemWithIncludesAsync(item.Id);
        return new OkObjectResult(new { Message = "Inventory item updated successfully.", Data = _mapper.Map<InventoryItemDto>(updatedItem) });
    }

    public async Task<IActionResult> DeleteInventoryItemAsync(Guid id)
    {
        var item = await _context.InventoryItems.FindAsync(id);

        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        if (item.Status == InventoryStatus.InUse)
        {
            return new BadRequestObjectResult(new { Message = "Cannot delete an inventory item that is currently in use. Please check it in first." });
        }

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();

        return new OkObjectResult(new { Message = "Inventory item deleted successfully." });
    }

    public async Task<IActionResult> CheckOutInventoryItemAsync(Guid id, string userId, CheckOutInventoryItemDto? dto = null)
    {
        var item = await GetItemWithIncludesAsync(id);

        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Message = "User not found." });
        }

        if (item.Status == InventoryStatus.InUse)
        {
            return new BadRequestObjectResult(new { Message = "This inventory item is already checked out by another user." });
        }

        if (item.Quantity <= 0)
        {
            return new BadRequestObjectResult(new { Message = "This inventory item is out of stock." });
        }

        // Check out the item
        item.Status = InventoryStatus.InUse;
        item.CurrentUserId = userId;
        item.CheckedOutAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedItem = await GetItemWithIncludesAsync(item.Id);
        return new OkObjectResult(new { Message = "Inventory item checked out successfully.", Data = _mapper.Map<InventoryItemDto>(updatedItem) });
    }

    public async Task<IActionResult> CheckInInventoryItemAsync(Guid id, string userId)
    {
        var item = await GetItemWithIncludesAsync(id);

        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        if (item.Status != InventoryStatus.InUse)
        {
            return new BadRequestObjectResult(new { Message = "This inventory item is not currently checked out." });
        }

        if (item.CurrentUserId != userId)
        {
            return new BadRequestObjectResult(new { Message = "You can only check in items that you have checked out." });
        }

        // Check in the item
        item.Status = InventoryStatus.Free;
        item.CurrentUserId = null;
        item.CheckedOutAt = null;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedItem = await GetItemWithIncludesAsync(item.Id);
        return new OkObjectResult(new { Message = "Inventory item checked in successfully.", Data = _mapper.Map<InventoryItemDto>(updatedItem) });
    }

    public async Task<IActionResult> AddImageToInventoryItemAsync(Guid id, Guid fileId)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        var file = await _context.UploadedFiles.FindAsync(fileId);
        if (file == null)
        {
            return new NotFoundObjectResult(new { Message = "File not found." });
        }

        var existingImage = await _context.InventoryItemImages
            .FirstOrDefaultAsync(img => img.InventoryItemId == id && img.UploadedFileId == fileId);

        if (existingImage != null)
        {
            return new BadRequestObjectResult(new { Message = "This image is already associated with the inventory item." });
        }

        var image = new InventoryItemImage
        {
            Id = Guid.NewGuid(),
            InventoryItemId = id,
            UploadedFileId = fileId,
            AddedAt = DateTime.UtcNow
        };

        _context.InventoryItemImages.Add(image);
        await _context.SaveChangesAsync();

        return new OkObjectResult(new { Message = "Image added successfully." });
    }

    public async Task<IActionResult> RemoveImageFromInventoryItemAsync(Guid id, Guid imageId)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
        {
            return new NotFoundObjectResult(new { Message = "Inventory item not found." });
        }

        var image = await _context.InventoryItemImages
            .FirstOrDefaultAsync(img => img.InventoryItemId == id && img.Id == imageId);

        if (image == null)
        {
            return new NotFoundObjectResult(new { Message = "Image not found for this inventory item." });
        }

        _context.InventoryItemImages.Remove(image);
        await _context.SaveChangesAsync();

        return new OkObjectResult(new { Message = "Image removed successfully." });
    }

    public async Task<IActionResult> SeedInventoryItemsAsync(string createdByUserId)
    {
        var user = await _context.Users.FindAsync(createdByUserId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Message = "Creator user not found." });
        }

        // Check if inventory items already exist
        var existingItemsCount = await _context.InventoryItems.CountAsync();
        if (existingItemsCount > 0)
        {
            return new BadRequestObjectResult(new { Message = "Inventory items already exist. Seeding is only allowed on an empty inventory." });
        }

        var seedItems = new List<InventoryItem>
        {
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Arduino Uno R3",
                Category = InventoryCategory.Electronic,
                Quantity = 5,
                Description = "Microcontroller board based on the ATmega328P",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Raspberry Pi 4 Model B",
                Category = InventoryCategory.Electronic,
                Quantity = 3,
                Description = "Single-board computer with 4GB RAM",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Soldering Iron Station",
                Category = InventoryCategory.Tool,
                Quantity = 2,
                Description = "Digital temperature controlled soldering station",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "3D Printer Filament (PLA)",
                Category = InventoryCategory.Components,
                Quantity = 10,
                Description = "1kg spools of PLA filament in various colors",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Oscilloscope",
                Category = InventoryCategory.Electronic,
                Quantity = 1,
                Description = "Digital storage oscilloscope 100MHz",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Breadboards",
                Category = InventoryCategory.Components,
                Quantity = 15,
                Description = "830 point solderless breadboards",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Screwdriver Set",
                Category = InventoryCategory.Tool,
                Quantity = 3,
                Description = "Precision screwdriver set with multiple bits",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Workbench",
                Category = InventoryCategory.Furniture,
                Quantity = 4,
                Description = "Heavy-duty electronics workbench with ESD protection",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Multimeter",
                Category = InventoryCategory.Electronic,
                Quantity = 6,
                Description = "Digital multimeter with auto-ranging",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            },
            new InventoryItem
            {
                Id = Guid.NewGuid(),
                Name = "Wire Stripper",
                Category = InventoryCategory.Tool,
                Quantity = 4,
                Description = "Automatic wire stripper and cutter",
                Status = InventoryStatus.Free,
                CreatedByUserId = createdByUserId,
                CreatedAt = DateTime.UtcNow
            }
        };

        _context.InventoryItems.AddRange(seedItems);
        await _context.SaveChangesAsync();

        return new OkObjectResult(new 
        { 
            Message = $"Successfully seeded {seedItems.Count} inventory items.", 
            Count = seedItems.Count,
            Items = seedItems.Select(i => new { i.Id, i.Name, i.Category, i.Quantity, i.Status }).ToList()
        });
    }

    public async Task<IActionResult> DeleteAllInventoryItemsAsync()
    {
        var allItems = await _context.InventoryItems.ToListAsync();
        var count = allItems.Count;

        if (count == 0)
        {
            return new OkObjectResult(new { Message = "No inventory items to delete." });
        }

        // Delete all associated images first
        var allImages = await _context.InventoryItemImages.ToListAsync();
        _context.InventoryItemImages.RemoveRange(allImages);

        // Delete all inventory items
        _context.InventoryItems.RemoveRange(allItems);
        await _context.SaveChangesAsync();

        return new OkObjectResult(new { Message = $"Successfully deleted {count} inventory items.", Count = count });
    }

    #region Helper Methods

    private async Task<InventoryItem?> GetItemWithIncludesAsync(Guid id)
    {
        return await _context.InventoryItems
            .Include(i => i.CurrentUser)
            .Include(i => i.CreatedByUser)
            .Include(i => i.Images)
                .ThenInclude(img => img.UploadedFile)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    #endregion
}
