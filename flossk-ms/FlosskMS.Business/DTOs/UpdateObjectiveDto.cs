using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateObjectiveDto
{
    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Status { get; set; } = string.Empty;

    [Range(1, 10)]
    public int Points { get; set; } = 1;
}
