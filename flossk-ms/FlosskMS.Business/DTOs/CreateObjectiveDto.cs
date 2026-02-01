using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class CreateObjectiveDto
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    [StringLength(200, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = "Todo";
}
