namespace FlosskMS.Business.DTOs;

public class ReactionDto
{
    public Guid Id { get; set; }
    public string Emoji { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserFirstName { get; set; } = string.Empty;
    public string UserLastName { get; set; } = string.Empty;
    public string? UserProfilePicture { get; set; }
    public DateTime CreatedAt { get; set; }
}
