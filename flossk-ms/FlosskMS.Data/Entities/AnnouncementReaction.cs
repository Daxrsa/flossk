namespace FlosskMS.Data.Entities;

public class AnnouncementReaction
{
    public Guid Id { get; set; }
    public Guid AnnouncementId { get; set; }
    public Announcement Announcement { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public string Emoji { get; set; } = string.Empty; // e.g., "👍", "❤️", "😂", "😮", "😢", "😡"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
