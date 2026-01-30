namespace FlosskMS.Data.Entities;

public class UserRfidCard
{
    public Guid Id { get; set; }
    public string CardIdentifier { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public string RegisteredByUserId { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    // Assignment tracking (nullable - card can be unassigned)
    public string? UserId { get; set; }
    public DateTime? AssignedAt { get; set; }
    public string? AssignedByUserId { get; set; }

    // Revocation tracking
    public DateTime? RevokedAt { get; set; }
    public string? RevokedByUserId { get; set; }
    public string? RevocationReason { get; set; }

    // Navigation properties
    public ApplicationUser RegisteredByUser { get; set; } = null!;
    public ApplicationUser? User { get; set; }
    public ApplicationUser? AssignedByUser { get; set; }
    public ApplicationUser? RevokedByUser { get; set; }
}
