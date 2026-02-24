namespace FlosskMS.Business.DTOs;

public class ElectionCandidateDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Biography { get; set; }
    public int Votes { get; set; }
}
