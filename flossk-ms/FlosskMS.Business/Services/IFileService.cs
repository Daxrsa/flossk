using FlosskMS.Business.DTOs;
using Microsoft.AspNetCore.Http;

namespace FlosskMS.Business.Services;

public interface IFileService
{
    Task<FileUploadResultDto> UploadFileAsync(IFormFile file, string userId, CancellationToken cancellationToken = default);
    Task<MultipleFileUploadResultDto> UploadFilesAsync(IEnumerable<IFormFile> files, string userId, CancellationToken cancellationToken = default);
    Task<FileDto?> GetFileByIdAsync(Guid fileId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileDto>> GetFilesByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FileDto>> GetAllFilesAsync(CancellationToken cancellationToken = default);
    Task<(Stream? FileStream, string? ContentType, string? FileName)> DownloadFileAsync(Guid fileId, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(Guid fileId, string userId, bool isAdmin = false, CancellationToken cancellationToken = default);
}
