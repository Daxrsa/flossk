using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateCollaborationPadDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [Url]
    [MaxLength(2000)]
    public string Url { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Description { get; set; }
}
