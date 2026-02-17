namespace FlosskMS.Business.DTOs;

public class InventoryItemListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Current user (abbreviated)
    public string? CurrentUserEmail { get; set; }
    
    // First image thumbnail if available
    public string? ThumbnailPath { get; set; }
}
