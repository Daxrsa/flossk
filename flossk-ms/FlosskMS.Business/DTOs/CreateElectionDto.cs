namespace FlosskMS.Business.DTOs;

public class CreateElectionDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    /// <summary>User IDs of the nominated candidates.</summary>
    public List<string> CandidateIds { get; set; } = [];
}
