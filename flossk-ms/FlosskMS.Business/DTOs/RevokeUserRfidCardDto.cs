using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class RevokeUserRfidCardDto
{
    [MaxLength(500)]
    public string? Reason { get; set; }
}
