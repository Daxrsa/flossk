using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateAnnouncementDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Body { get; set; } = string.Empty;
    
    [Required]
    public string Importance { get; set; } = "Normal"; // Normal, Medium, High, Urgent
    
    [Required]
    public string Category { get; set; } = "General"; // General, Events, Updates, Maintenance, Meetings
}
