namespace FlosskMS.Business.DTOs;

public class CastVoteDto
{
    /// <summary>User IDs of exactly 3 candidates being voted for.</summary>
    public List<string> CandidateUserIds { get; set; } = [];
}
