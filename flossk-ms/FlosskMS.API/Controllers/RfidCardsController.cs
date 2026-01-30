using System.Security.Claims;
using FlosskMS.Business.DTOs;
using FlosskMS.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class RfidCardsController(IRfidCardService rfidCardService) : ControllerBase
{
    private readonly IRfidCardService _rfidCardService = rfidCardService;

    /// <summary>
    /// Get all RFID cards with optional filtering and pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllCards(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? activeOnly = null,
        [FromQuery] bool? assignedOnly = null)
    {
        return await _rfidCardService.GetAllCardsAsync(page, pageSize, activeOnly, assignedOnly);
    }

    /// <summary>
    /// Get an RFID card by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCardById(Guid id)
    {
        return await _rfidCardService.GetCardByIdAsync(id);
    }

    /// <summary>
    /// Get all RFID cards for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetCardsByUserId(string userId)
    {
        return await _rfidCardService.GetCardsByUserIdAsync(userId);
    }

    /// <summary>
    /// Get an RFID card by its card identifier
    /// </summary>
    [HttpGet("identifier/{cardIdentifier}")]
    public async Task<IActionResult> GetCardByIdentifier(string cardIdentifier)
    {
        return await _rfidCardService.GetCardByIdentifierAsync(cardIdentifier);
    }

    /// <summary>
    /// Get all unassigned (available) RFID cards
    /// </summary>
    [HttpGet("unassigned")]
    public async Task<IActionResult> GetUnassignedCards()
    {
        return await _rfidCardService.GetUnassignedCardsAsync();
    }

    /// <summary>
    /// Check if a user has an active RFID card
    /// </summary>
    [HttpGet("user/{userId}/has-active-card")]
    public async Task<IActionResult> HasActiveCard(string userId)
    {
        return await _rfidCardService.HasActiveCardAsync(userId);
    }

    /// <summary>
    /// Assign an RFID card to a user (creates a new card entry)
    /// </summary>
    [HttpPost("assign")]
    public async Task<IActionResult> AssignCard([FromBody] AssignRfidCardDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _rfidCardService.AssignCardAsync(dto, userId);
    }

    /// <summary>
    /// Unassign an RFID card from its current user
    /// </summary>
    [HttpPatch("{id:guid}/unassign")]
    public async Task<IActionResult> UnassignCard(Guid id)
    {
        return await _rfidCardService.UnassignCardAsync(id);
    }

    /// <summary>
    /// Update an RFID card's notes
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCard(Guid id, [FromBody] UpdateUserRfidCardDto dto)
    {
        return await _rfidCardService.UpdateCardAsync(id, dto);
    }

    /// <summary>
    /// Revoke an RFID card
    /// </summary>
    [HttpPatch("{id:guid}/revoke")]
    public async Task<IActionResult> RevokeCard(Guid id, [FromBody] RevokeUserRfidCardDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        return await _rfidCardService.RevokeCardAsync(id, userId, dto);
    }

    /// <summary>
    /// Reactivate a revoked RFID card
    /// </summary>
    [HttpPatch("{id:guid}/reactivate")]
    public async Task<IActionResult> ReactivateCard(Guid id)
    {
        return await _rfidCardService.ReactivateCardAsync(id);
    }

    /// <summary>
    /// Delete an RFID card
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCard(Guid id)
    {
        return await _rfidCardService.DeleteCardAsync(id);
    }
}
