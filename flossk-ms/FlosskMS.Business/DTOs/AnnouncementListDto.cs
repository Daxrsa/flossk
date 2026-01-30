namespace FlosskMS.Business.DTOs;

public class AnnouncementListDto
{
    public List<AnnouncementDto> Announcements { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
