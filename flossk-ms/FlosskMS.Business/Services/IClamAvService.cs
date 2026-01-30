namespace FlosskMS.Business.Services;

public interface IClamAvService
{
    Task<ClamAvScanResult> ScanFileAsync(Stream fileStream, CancellationToken cancellationToken = default);
    Task<ClamAvScanResult> ScanFileAsync(byte[] fileBytes, CancellationToken cancellationToken = default);
    Task<bool> PingAsync(CancellationToken cancellationToken = default);
}

public class ClamAvScanResult
{
    public bool IsScanned { get; set; }
    public bool IsSafe { get; set; }
    public string? VirusName { get; set; }
    public string RawResult { get; set; } = string.Empty;
    public string? Error { get; set; }
}
