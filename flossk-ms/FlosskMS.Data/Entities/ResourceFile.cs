namespace FlosskMS.Data.Entities;

public class ResourceFile
{
    public Guid Id { get; set; }
    
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    
    public Guid FileId { get; set; }
    public UploadedFile File { get; set; } = null!;
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
