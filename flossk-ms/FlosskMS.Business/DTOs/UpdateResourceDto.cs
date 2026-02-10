using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateResourceDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    [Url]
    public string? Url { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public string Type { get; set; } = string.Empty;
    
    /// <summary>
    /// File IDs to add to the resource
    /// </summary>
    public List<Guid>? FileIdsToAdd { get; set; }
    
    /// <summary>
    /// File IDs to remove from the resource
    /// </summary>
    public List<Guid>? FileIdsToRemove { get; set; }
}
