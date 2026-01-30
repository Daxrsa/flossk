using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FlosskMS.Business.DTOs;

public class CreateMembershipRequestDto
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;
    
    [Required]
    [Phone]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string SchoolOrCompany { get; set; } = string.Empty;
    
    [Required]
    public DateTime DateOfBirth { get; set; }
    
    [Required]
    [MaxLength(2000)]
    public string Statement { get; set; } = string.Empty;
    
    /// <summary>
    /// ID card number
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string IdCardNumber { get; set; } = string.Empty;
    
    /// <summary>
    /// Applicant signature (if 14 or older) or Guardian signature (if under 14)
    /// </summary>
    [Required]
    public IFormFile SignatureFile { get; set; } = null!;
}
