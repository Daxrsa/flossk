namespace FlosskMS.Business.DTOs;

public class ElectionListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int TotalVotes { get; set; }
    public int CandidateCount { get; set; }
    public bool IsFinalized { get; set; }
}
