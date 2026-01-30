namespace FlosskMS.Business.DTOs;

public class CollaborationPadListDto
{
    public List<CollaborationPadDto> CollaborationPads { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
