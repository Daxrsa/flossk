using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface ICollaborationPadService
{
    Task<IActionResult> CreateCollaborationPadAsync(CreateCollaborationPadDto request, string userId);
    Task<IActionResult> UpdateCollaborationPadAsync(Guid id, UpdateCollaborationPadDto request, string userId);
    Task<IActionResult> GetCollaborationPadsAsync(int page = 1, int pageSize = 10, string? search = null);
    Task<IActionResult> GetCollaborationPadByIdAsync(Guid id);
    Task<IActionResult> DeleteCollaborationPadAsync(Guid id, string userId);
}
