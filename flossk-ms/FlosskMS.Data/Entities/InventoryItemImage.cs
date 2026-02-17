namespace FlosskMS.Data.Entities;

public class InventoryItemImage
{
    public Guid Id { get; set; }
    public Guid InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;
    public Guid UploadedFileId { get; set; }
    public UploadedFile UploadedFile { get; set; } = null!;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
