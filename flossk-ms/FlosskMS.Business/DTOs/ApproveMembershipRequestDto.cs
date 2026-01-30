using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FlosskMS.Business.DTOs;

public class ApproveMembershipRequestDto
{
    /// <summary>
    /// Board member signature image (required for approval)
    /// </summary>
    [Required]
    public IFormFile BoardMemberSignature { get; set; } = null!;
}
