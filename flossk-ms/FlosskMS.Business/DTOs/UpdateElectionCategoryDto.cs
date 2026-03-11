using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class UpdateElectionCategoryDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Allowed values: "AdminOnly", "FullMembersOnly", "AllUsers"
    /// </summary>
    [Required]
    public string VotingRule { get; set; } = "AllUsers";
}
