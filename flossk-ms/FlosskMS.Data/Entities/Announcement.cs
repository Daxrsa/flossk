namespace FlosskMS.Data.Entities;

public class Announcement
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public AnnouncementImportance Importance { get; set; } = AnnouncementImportance.Medium;
    public AnnouncementCategory Category { get; set; } = AnnouncementCategory.General;
    public bool IsEdited { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Creator tracking
    public string CreatedByUserId { get; set; } = string.Empty;
    public ApplicationUser CreatedByUser { get; set; } = null!;
}
