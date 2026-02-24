namespace FlosskMS.Data.Entities;

/// <summary>
/// Join table: a user nominated as a candidate in an election.
/// </summary>
public class ElectionCandidate
{
    public Guid Id { get; set; }

    public Guid ElectionId { get; set; }
    public Election Election { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
}
