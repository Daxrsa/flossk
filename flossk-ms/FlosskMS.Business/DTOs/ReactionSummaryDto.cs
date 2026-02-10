namespace FlosskMS.Business.DTOs;

public class ReactionSummaryDto
{
    public string Emoji { get; set; } = string.Empty;
    public int Count { get; set; }
    public List<ReactionUserDto> Users { get; set; } = new();
    public bool CurrentUserReacted { get; set; }
}

public class ReactionUserDto
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
}
