namespace FlosskMS.Data.Entities;

public class ApprovedEmail
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public DateTime ApprovedAt { get; set; } = DateTime.UtcNow;
    public string? ApprovedBy { get; set; }
}
