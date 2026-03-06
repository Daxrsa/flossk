using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class CheckInInventoryItemDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; } = 1;
    
    [StringLength(500)]
    public string? Notes { get; set; }
}
