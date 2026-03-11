namespace FlosskMS.Data.Entities;

public class ElectionCategory
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ElectionVotingRule VotingRule { get; set; } = ElectionVotingRule.AllUsers;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string CreatedByUserId { get; set; } = string.Empty;
    public ApplicationUser CreatedByUser { get; set; } = null!;
}
