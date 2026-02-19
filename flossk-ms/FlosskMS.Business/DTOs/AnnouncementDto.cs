namespace FlosskMS.Business.DTOs;

public class AnnouncementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public string Importance { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Creator info
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatedByFirstName { get; set; } = string.Empty;
    public string CreatedByLastName { get; set; } = string.Empty;
    public string CreatedByProfilePicture { get; set; } = string.Empty;
    
    // Permission flags
    public bool IsCurrentUserCreator { get; set; }
    
    // Reactions
    public List<ReactionSummaryDto> Reactions { get; set; } = new();
}
