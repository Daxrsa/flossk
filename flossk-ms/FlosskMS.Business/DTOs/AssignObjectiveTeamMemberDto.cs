using System.ComponentModel.DataAnnotations;

namespace FlosskMS.Business.DTOs;

public class AssignObjectiveTeamMemberDto
{
    [Required]
    public string UserId { get; set; } = string.Empty;
}
