using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateUserRfidCardDto
{
    public DateTime? ExpiresAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
