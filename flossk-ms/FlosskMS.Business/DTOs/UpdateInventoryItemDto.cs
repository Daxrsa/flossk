using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateInventoryItemDto
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    public string? Category { get; set; }

    [Range(0, int.MaxValue)]
    public int? Quantity { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    public List<Guid>? ImageFileIds { get; set; }
}
