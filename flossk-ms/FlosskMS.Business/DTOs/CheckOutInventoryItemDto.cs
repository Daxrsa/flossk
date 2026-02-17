using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class CheckOutInventoryItemDto
{
    [StringLength(500)]
    public string? Notes { get; set; }
}
