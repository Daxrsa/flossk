namespace FlosskMS.Business.DTOs;

public class UpdateElectionDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    /// <summary>Replaces the full candidate list.</summary>
    public List<string> CandidateIds { get; set; } = [];
}
