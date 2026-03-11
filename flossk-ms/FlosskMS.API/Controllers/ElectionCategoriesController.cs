using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ElectionCategoriesController(IElectionCategoryService electionCategoryService) : ControllerBase
{
    private readonly IElectionCategoryService _electionCategoryService = electionCategoryService;

    /// <summary>
    /// Get all election categories (available to all authenticated users).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetElectionCategories()
    {
        return await _electionCategoryService.GetElectionCategoriesAsync();
    }

    /// <summary>
    /// Get a single election category by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetElectionCategory(Guid id)
    {
        return await _electionCategoryService.GetElectionCategoryByIdAsync(id);
    }

    /// <summary>
    /// Create a new election category (Admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateElectionCategory([FromBody] CreateElectionCategoryDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        return await _electionCategoryService.CreateElectionCategoryAsync(request, userId);
    }

    /// <summary>
    /// Update an election category (Admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateElectionCategory(Guid id, [FromBody] UpdateElectionCategoryDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        return await _electionCategoryService.UpdateElectionCategoryAsync(id, request, userId);
    }

    /// <summary>
    /// Delete an election category (Admin only).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteElectionCategory(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        return await _electionCategoryService.DeleteElectionCategoryAsync(id, userId);
    }
}
