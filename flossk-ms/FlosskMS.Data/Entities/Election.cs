namespace FlosskMS.Data.Entities;

public class Election
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public ElectionStatus Status { get; set; } = ElectionStatus.Upcoming;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Whether an Admin has explicitly finalized the election and applied role promotions.
    /// Once true the election is locked and results are permanently visible.
    /// </summary>
    public bool IsFinalized { get; set; } = false;
    public DateTime? FinalizedAt { get; set; }

    public string? FinalizedByUserId { get; set; }
    public ApplicationUser? FinalizedByUser { get; set; }

    public string CreatedByUserId { get; set; } = string.Empty;
    public ApplicationUser CreatedByUser { get; set; } = null!;

    public ICollection<ElectionCandidate> Candidates { get; set; } = [];
    public ICollection<ElectionVote> Votes { get; set; } = [];
}
