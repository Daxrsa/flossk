namespace FlosskMS.Business.DTOs;

public class CertificateListDto
{
    public List<CertificateDto> Certificates { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
