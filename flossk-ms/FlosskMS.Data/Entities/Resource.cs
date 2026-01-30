namespace FlosskMS.Data.Entities;

public class Resource
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ResourceType Type { get; set; } = ResourceType.Other;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Optional relationship to Project (a resource can belong to a project)
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    // Optional relationship to Objective (a resource can belong to an objective)
    public Guid? ObjectiveId { get; set; }
    public Objective? Objective { get; set; }
}
