using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace FlosskMS.Business.Services;

public interface IRfidCardService
{
    Task<IActionResult> GetAllCardsAsync(int page = 1, int pageSize = 20, bool? activeOnly = null, bool? assignedOnly = null);
    Task<IActionResult> GetCardByIdAsync(Guid id);
    Task<IActionResult> GetCardsByUserIdAsync(string userId);
    Task<IActionResult> GetCardByIdentifierAsync(string cardIdentifier);
    Task<IActionResult> GetUnassignedCardsAsync();
    Task<IActionResult> HasActiveCardAsync(string userId);
    Task<IActionResult> AssignCardAsync(AssignRfidCardDto dto, string assignedByUserId);
    Task<IActionResult> UnassignCardAsync(Guid cardId);
    Task<IActionResult> UpdateCardAsync(Guid id, UpdateUserRfidCardDto dto);
    Task<IActionResult> RevokeCardAsync(Guid id, string revokedByUserId, RevokeUserRfidCardDto dto);
    Task<IActionResult> ReactivateCardAsync(Guid id);
    Task<IActionResult> DeleteCardAsync(Guid id);
}
