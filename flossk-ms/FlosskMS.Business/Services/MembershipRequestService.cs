using AutoMapper;
using FlosskMS.Business.Configuration;
using FlosskMS.Business.DTOs;
using FlosskMS.Data;
using FlosskMS.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FlosskMS.Business.Services;

public class MembershipRequestService : IMembershipRequestService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IClamAvService _clamAvService;
    private readonly FileUploadSettings _fileSettings;
    private readonly IMapper _mapper;
    private readonly ILogger<MembershipRequestService> _logger;

    public MembershipRequestService(
        ApplicationDbContext dbContext,
        IClamAvService clamAvService,
        IOptions<FileUploadSettings> fileSettings,
        IMapper mapper,
        ILogger<MembershipRequestService> logger)
    {
        _dbContext = dbContext;
        _clamAvService = clamAvService;
        _fileSettings = fileSettings.Value;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IActionResult> CreateMembershipRequestAsync(
        CreateMembershipRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.FullName))
            return new BadRequestObjectResult(new { Error = "Full name is required." });

        if (string.IsNullOrWhiteSpace(request.Address))
            return new BadRequestObjectResult(new { Error = "Address is required." });

        if (string.IsNullOrWhiteSpace(request.City))
            return new BadRequestObjectResult(new { Error = "City is required." });

        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return new BadRequestObjectResult(new { Error = "Phone number is required." });

        if (string.IsNullOrWhiteSpace(request.Email))
            return new BadRequestObjectResult(new { Error = "Email is required." });

        if (string.IsNullOrWhiteSpace(request.SchoolOrCompany))
            return new BadRequestObjectResult(new { Error = "School/Company is required." });

        if (request.DateOfBirth == default)
            return new BadRequestObjectResult(new { Error = "Date of birth is required." });

        if (request.DateOfBirth > DateTime.UtcNow)
            return new BadRequestObjectResult(new { Error = "Date of birth cannot be in the future." });

        if (string.IsNullOrWhiteSpace(request.Statement))
            return new BadRequestObjectResult(new { Error = "Statement is required." });

        if (string.IsNullOrWhiteSpace(request.IdCardNumber))
            return new BadRequestObjectResult(new { Error = "ID card number is required." });

        if (request.SignatureFile == null || request.SignatureFile.Length == 0)
            return new BadRequestObjectResult(new { Error = "Signature file is required." });

        // Check for duplicate email
        var existingRequest = await _dbContext.MembershipRequests
            .AnyAsync(r => r.Email.ToLower() == request.Email.ToLower() && r.Status == MembershipRequestStatus.Pending, cancellationToken);
        
        if (existingRequest)
            return new BadRequestObjectResult(new { Error = "A pending membership request with this email already exists." });

        // Determine if applicant is under 14
        var isUnder14 = CalculateAge(request.DateOfBirth) < 14;

        // Upload signature file
        var signatureUploadResult = await UploadFileInternalAsync(request.SignatureFile, "membership-signature", cancellationToken);
        if (!signatureUploadResult.Success)
        {
            return new BadRequestObjectResult(new { Error = signatureUploadResult.Error });
        }

        // Create membership request
        var membershipRequest = _mapper.Map<MembershipRequest>(request);
        membershipRequest.Id = Guid.NewGuid();
        membershipRequest.Status = MembershipRequestStatus.Pending;
        membershipRequest.CreatedAt = DateTime.UtcNow;

        // Set signature based on age
        if (isUnder14)
        {
            membershipRequest.GuardianSignatureFileId = signatureUploadResult.FileId;
        }
        else
        {
            membershipRequest.ApplicantSignatureFileId = signatureUploadResult.FileId;
        }

        _dbContext.MembershipRequests.Add(membershipRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Membership request {RequestId} created for email {Email}", 
            membershipRequest.Id, membershipRequest.Email);

        // Reload with related data
        var savedRequest = await _dbContext.MembershipRequests
            .Include(r => r.ApplicantSignatureFile)
            .Include(r => r.GuardianSignatureFile)
            .FirstAsync(r => r.Id == membershipRequest.Id, cancellationToken);

        return new OkObjectResult(_mapper.Map<MembershipRequestDto>(savedRequest));
    }

    public async Task<IActionResult> GetMembershipRequestsAsync(
        int page = 1,
        int pageSize = 10,
        string? status = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _dbContext.MembershipRequests
            .Include(r => r.ReviewedByUser)
            .AsQueryable();

        // Filter by status
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<MembershipRequestStatus>(status, true, out var statusEnum))
        {
            query = query.Where(r => r.Status == statusEnum);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var result = new MembershipRequestListDto
        {
            Requests = _mapper.Map<List<MembershipRequestDto>>(requests),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return new OkObjectResult(result);
    }

    public async Task<IActionResult> GetMembershipRequestByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var request = await _dbContext.MembershipRequests
            .Include(r => r.ApplicantSignatureFile)
            .Include(r => r.GuardianSignatureFile)
            .Include(r => r.BoardMemberSignatureFile)
            .Include(r => r.ReviewedByUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (request == null)
            return new NotFoundObjectResult(new { Error = "Membership request not found." });

        return new OkObjectResult(_mapper.Map<MembershipRequestDto>(request));
    }

    public async Task<IActionResult> ApproveMembershipRequestAsync(
        Guid id,
        ApproveMembershipRequestDto request,
        string reviewerUserId,
        CancellationToken cancellationToken = default)
    {
        if (request.BoardMemberSignature == null || request.BoardMemberSignature.Length == 0)
            return new BadRequestObjectResult(new { Error = "Board member signature is required for approval." });

        var membershipRequest = await _dbContext.MembershipRequests
            .Include(r => r.ReviewedByUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (membershipRequest == null)
            return new NotFoundObjectResult(new { Error = "Membership request not found." });

        if (membershipRequest.Status != MembershipRequestStatus.Pending)
            return new BadRequestObjectResult(new { Error = $"Cannot approve a request that is already {membershipRequest.Status}." });

        var reviewer = await _dbContext.Users.FindAsync([reviewerUserId], cancellationToken);
        if (reviewer == null)
            return new NotFoundObjectResult(new { Error = "Reviewer not found." });

        // Upload board member signature
        var signatureUploadResult = await UploadFileInternalAsync(request.BoardMemberSignature, "board-signature", cancellationToken);
        if (!signatureUploadResult.Success)
            return new BadRequestObjectResult(new { Error = signatureUploadResult.Error });

        membershipRequest.Status = MembershipRequestStatus.Approved;
        membershipRequest.ReviewedAt = DateTime.UtcNow;
        membershipRequest.ReviewedByUserId = reviewerUserId;
        membershipRequest.BoardMemberSignatureFileId = signatureUploadResult.FileId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Membership request {RequestId} approved by user {UserId}", id, reviewerUserId);

        return new OkObjectResult(new { Message = $"User with email: {membershipRequest.Email} approved successfully" });
    }

    public async Task<IActionResult> RejectMembershipRequestAsync(
        Guid id,
        RejectMembershipRequestDto request,
        string reviewerUserId,
        CancellationToken cancellationToken = default)
    {
        var membershipRequest = await _dbContext.MembershipRequests
            .Include(r => r.ReviewedByUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (membershipRequest == null)
            return new NotFoundObjectResult(new { Error = "Membership request not found." });

        if (membershipRequest.Status != MembershipRequestStatus.Pending)
            return new BadRequestObjectResult(new { Error = $"Cannot reject a request that is already {membershipRequest.Status}." });

        var reviewer = await _dbContext.Users.FindAsync([reviewerUserId], cancellationToken);
        if (reviewer == null)
            return new NotFoundObjectResult(new { Error = "Reviewer not found." });

        membershipRequest.Status = MembershipRequestStatus.Rejected;
        membershipRequest.ReviewedAt = DateTime.UtcNow;
        membershipRequest.ReviewedByUserId = reviewerUserId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Membership request {RequestId} rejected by user {UserId}", id, reviewerUserId);

        return new OkObjectResult(new { Message = $"User with email: {membershipRequest.Email} rejected successfully" });
    }

    public async Task<IActionResult> GetApprovedMembersAsync(
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _dbContext.MembershipRequests
            .Include(r => r.ReviewedByUser)
            .Where(r => r.Status == MembershipRequestStatus.Approved);

        var totalCount = await query.CountAsync(cancellationToken);

        var approvedMembers = await query
            .OrderByDescending(r => r.ReviewedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var result = new MembershipRequestListDto
        {
            Requests = _mapper.Map<List<MembershipRequestDto>>(approvedMembers),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return new OkObjectResult(result);
    }

    public async Task<IActionResult> DownloadContractAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var membershipRequest = await _dbContext.MembershipRequests
            .Include(r => r.ApplicantSignatureFile)
            .Include(r => r.GuardianSignatureFile)
            .Include(r => r.BoardMemberSignatureFile)
            .Include(r => r.ReviewedByUser)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (membershipRequest == null)
            return new NotFoundObjectResult(new { Error = "Membership request not found." });

        if (membershipRequest.Status != MembershipRequestStatus.Approved)
            return new BadRequestObjectResult(new { Error = "Contract is only available for approved membership requests." });

        // Configure QuestPDF license (Community license for open source)
        QuestPDF.Settings.License = LicenseType.Community;

        // Generate PDF
        var pdfBytes = GenerateContractPdf(membershipRequest);

        return new FileContentResult(pdfBytes, "application/pdf")
        {
            FileDownloadName = $"FLOSSK_Membership_Contract_{membershipRequest.FullName.Replace(" ", "_")}_{membershipRequest.Id}.pdf"
        };
    }

    private byte[] GenerateContractPdf(MembershipRequest request)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Element(ComposeHeader);
                page.Content().Element(c => ComposeContent(c, request));
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().AlignCenter().Text("FLOSSK")
                .FontSize(24).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().AlignCenter().Text("Free Libre Open Source Software Kosova")
                .FontSize(12).Italic();
            column.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Medium);
            column.Item().AlignCenter().Text("MEMBERSHIP CONTRACT")
                .FontSize(18).Bold();
            column.Item().Height(20);
        });
    }

    private void ComposeContent(IContainer container, MembershipRequest request)
    {
        container.Column(column =>
        {
            // Member Information Section
            column.Item().Text("MEMBER INFORMATION").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
            
            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                });

                AddTableRow(table, "Full Name:", request.FullName);
                AddTableRow(table, "Email:", request.Email);
                AddTableRow(table, "Phone Number:", request.PhoneNumber);
                AddTableRow(table, "Address:", request.Address);
                AddTableRow(table, "City:", request.City);
                AddTableRow(table, "Date of Birth:", request.DateOfBirth.ToString("MMMM dd, yyyy"));
                AddTableRow(table, "ID Card Number:", request.IdCardNumber);
                AddTableRow(table, "School/Company:", request.SchoolOrCompany);
            });

            // Statement Section
            column.Item().PaddingTop(20).Text("PERSONAL STATEMENT").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
            column.Item().PaddingTop(10).Text(request.Statement).Justify();

            // Application Details
            column.Item().PaddingTop(20).Text("APPLICATION DETAILS").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
            
            column.Item().PaddingTop(10).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(2);
                });

                AddTableRow(table, "Application Date:", request.CreatedAt.ToString("MMMM dd, yyyy"));
                AddTableRow(table, "Approval Date:", request.ReviewedAt?.ToString("MMMM dd, yyyy") ?? "N/A");
                AddTableRow(table, "Applicant Type:", request.IsUnder14() ? "Minor (Under 14)" : "Adult");
            });

            // Signatures Section
            column.Item().PaddingTop(30).Text("SIGNATURES").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);

            column.Item().PaddingTop(15).Row(row =>
            {
                // Applicant/Guardian Signature
                row.RelativeItem().Column(signatureColumn =>
                {
                    var signatureLabel = request.IsUnder14() ? "Guardian Signature" : "Applicant Signature";
                    signatureColumn.Item().Text(signatureLabel).Bold();
                    signatureColumn.Item().Height(10);

                    var signatureFile = request.IsUnder14() 
                        ? request.GuardianSignatureFile 
                        : request.ApplicantSignatureFile;

                    if (signatureFile != null && File.Exists(signatureFile.FilePath))
                    {
                        signatureColumn.Item().Height(60).Image(signatureFile.FilePath).FitArea();
                    }
                    else
                    {
                        signatureColumn.Item().Height(60).Border(1).BorderColor(Colors.Grey.Lighten1)
                            .AlignCenter().AlignMiddle().Text("[Signature on file]").Italic().FontColor(Colors.Grey.Medium);
                    }

                    signatureColumn.Item().Height(5);
                    signatureColumn.Item().Text(request.FullName).FontSize(10);
                    signatureColumn.Item().Text($"Date: {request.CreatedAt:MMMM dd, yyyy}").FontSize(9).FontColor(Colors.Grey.Darken1);
                });

                row.ConstantItem(40); // Spacer

                // Board Member Signature
                row.RelativeItem().Column(signatureColumn =>
                {
                    signatureColumn.Item().Text("Board Member Signature").Bold();
                    signatureColumn.Item().Height(10);

                    if (request.BoardMemberSignatureFile != null && File.Exists(request.BoardMemberSignatureFile.FilePath))
                    {
                        signatureColumn.Item().Height(60).Image(request.BoardMemberSignatureFile.FilePath).FitArea();
                    }
                    else
                    {
                        signatureColumn.Item().Height(60).Border(1).BorderColor(Colors.Grey.Lighten1)
                            .AlignCenter().AlignMiddle().Text("[Signature on file]").Italic().FontColor(Colors.Grey.Medium);
                    }

                    signatureColumn.Item().Height(5);
                    var reviewerName = request.ReviewedByUser != null 
                        ? $"{request.ReviewedByUser.FirstName} {request.ReviewedByUser.LastName}" 
                        : "Board Member";
                    signatureColumn.Item().Text(reviewerName).FontSize(10);
                    signatureColumn.Item().Text($"Date: {request.ReviewedAt?.ToString("MMMM dd, yyyy") ?? "N/A"}").FontSize(9).FontColor(Colors.Grey.Darken1);
                });
            });

            // Terms and Conditions
            column.Item().PaddingTop(30).Text("TERMS AND CONDITIONS").FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
            column.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
            column.Item().PaddingTop(10).Text(text =>
            {
                text.Span("By signing this contract, the member agrees to abide by the bylaws and regulations of FLOSSK, ")
                    .FontSize(10);
                text.Span("contribute to the organization's mission of promoting Free/Libre Open Source Software in Kosova, ")
                    .FontSize(10);
                text.Span("and uphold the values of transparency, collaboration, and community engagement.")
                    .FontSize(10);
            });
        });
    }

    private static void AddTableRow(TableDescriptor table, string label, string value)
    {
        table.Cell().PaddingVertical(3).Text(label).Bold();
        table.Cell().PaddingVertical(3).Text(value);
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
            column.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text($"Generated on {DateTime.UtcNow:MMMM dd, yyyy 'at' HH:mm 'UTC'}").FontSize(8).FontColor(Colors.Grey.Medium);
                row.RelativeItem().AlignRight().Text("FLOSSK Membership Contract").FontSize(8).FontColor(Colors.Grey.Medium);
            });
        });
    }

    #region Private Helper Methods

    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.UtcNow.Date;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }

    private async Task<(bool Success, Guid FileId, string? Error)> UploadFileInternalAsync(
        IFormFile file, 
        string category,
        CancellationToken cancellationToken)
    {
        // Validate file size
        if (file.Length > _fileSettings.MaxFileSizeBytes)
        {
            return (false, Guid.Empty, $"File size exceeds maximum allowed size of {_fileSettings.MaxFileSizeBytes / (1024 * 1024)}MB.");
        }

        // Validate file extension for images
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".pdf" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return (false, Guid.Empty, $"File type not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
        }

        // Read file into memory for scanning
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        var fileBytes = memoryStream.ToArray();

        // Scan with ClamAV
        var scanResult = await _clamAvService.ScanFileAsync(fileBytes, cancellationToken);

        if (!scanResult.IsScanned)
        {
            _logger.LogWarning("ClamAV scan failed: {Error}. Rejecting file upload.", scanResult.Error);
            return (false, Guid.Empty, $"Virus scan failed: {scanResult.Error}. File upload rejected for security.");
        }

        if (!scanResult.IsSafe)
        {
            _logger.LogWarning("Malware detected in uploaded file: {VirusName}", scanResult.VirusName);
            return (false, Guid.Empty, $"Malware detected: {scanResult.VirusName}. File rejected.");
        }

        // Generate unique filename
        var uniqueFileName = $"{category}-{Guid.NewGuid()}{extension}";

        // Ensure upload directory exists
        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), _fileSettings.UploadPath, "membership");
        Directory.CreateDirectory(uploadPath);

        var filePath = Path.Combine(uploadPath, uniqueFileName);

        // Save file to disk
        await System.IO.File.WriteAllBytesAsync(filePath, fileBytes, cancellationToken);

        // Create database record (without user tracking for anonymous uploads)
        var uploadedFile = new UploadedFile
        {
            Id = Guid.NewGuid(),
            FileName = uniqueFileName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            FilePath = filePath,
            UploadedAt = DateTime.UtcNow,
            CreatedByUserId = null, // Anonymous upload
            IsScanned = true,
            IsSafe = true,
            ScanResult = scanResult.RawResult
        };

        _dbContext.UploadedFiles.Add(uploadedFile);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (true, uploadedFile.Id, null);
    }

    private async Task DeleteFileInternalAsync(Guid fileId, CancellationToken cancellationToken)
    {
        var file = await _dbContext.UploadedFiles.FindAsync([fileId], cancellationToken);
        if (file != null)
        {
            if (System.IO.File.Exists(file.FilePath))
            {
                System.IO.File.Delete(file.FilePath);
            }
            _dbContext.UploadedFiles.Remove(file);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    #endregion
}
