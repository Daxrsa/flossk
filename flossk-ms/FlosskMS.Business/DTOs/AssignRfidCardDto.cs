using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class AssignRfidCardDto
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string CardIdentifier { get; set; } = string.Empty;

    public string? Notes { get; set; }
}
