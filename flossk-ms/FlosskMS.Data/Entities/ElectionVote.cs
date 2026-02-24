namespace FlosskMS.Data.Entities;

/// <summary>
/// A single vote cast by a member in an election.
/// Each member casts exactly 3 votes per election (one row per selected candidate).
/// </summary>
public class ElectionVote
{
    public Guid Id { get; set; }

    public Guid ElectionId { get; set; }
    public Election Election { get; set; } = null!;

    /// <summary>The user who cast the vote.</summary>
    public string VoterUserId { get; set; } = string.Empty;
    public ApplicationUser VoterUser { get; set; } = null!;

    /// <summary>The candidate (user) the vote is for.</summary>
    public string CandidateUserId { get; set; } = string.Empty;
    public ApplicationUser CandidateUser { get; set; } = null!;

    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
}
