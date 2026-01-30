namespace FlosskMS.Business.DTOs;

public class MembershipRequestListDto
{
    public List<MembershipRequestDto> Requests { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
