using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CertificatesController(ICertificateService certificateService) : ControllerBase
{
    private readonly ICertificateService _certificateService = certificateService;

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> IssueCertificates([FromBody] IssueCertificateDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        return await _certificateService.IssueCertificatesAsync(request, userId);
    }

    [HttpGet]
    public async Task<IActionResult> GetCertificates(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return await _certificateService.GetCertificatesAsync(page, pageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCertificateById(Guid id)
    {
        return await _certificateService.GetCertificateByIdAsync(id);
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> DownloadCertificate(Guid id)
    {
        return await _certificateService.DownloadCertificateAsync(id);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/revoke")]
    public async Task<IActionResult> RevokeCertificate(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        return await _certificateService.RevokeCertificateAsync(id, userId);
    }
}
