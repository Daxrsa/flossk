using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IElectionService
{
    Task<IActionResult> GetElectionsAsync();
    Task<IActionResult> GetElectionByIdAsync(Guid id, string userId);
    Task<IActionResult> CreateElectionAsync(CreateElectionDto request, string userId);
    Task<IActionResult> UpdateElectionAsync(Guid id, UpdateElectionDto request, string userId);
    Task<IActionResult> DeleteElectionAsync(Guid id, string userId);
    Task<IActionResult> CastVoteAsync(Guid id, CastVoteDto request, string userId);
}
