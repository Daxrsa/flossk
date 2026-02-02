namespace FlosskMS.Business.DTOs;

public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime JoinedAt { get; set; }
}
