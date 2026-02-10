namespace FlosskMS.Data.Entities;

public class CalendarEvent
{
    public Guid Id { get; set; }
    public string CalendarUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Creator tracking
    public string CreatedByUserId { get; set; } = string.Empty;
    public ApplicationUser CreatedByUser { get; set; } = null!;
}
