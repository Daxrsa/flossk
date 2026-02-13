namespace FlosskMS.Data.Entities;

public class AnnouncementView
{
    public Guid Id { get; set; }
    public Guid AnnouncementId { get; set; }
    public Announcement Announcement { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
}
