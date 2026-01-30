using System.Net.Sockets;
using System.Text;
using FlosskMS.Business.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FlosskMS.Business.Services;

public class ClamAvService : IClamAvService
{
    private readonly ClamAvSettings _settings;
    private readonly ILogger<ClamAvService> _logger;

    public ClamAvService(IOptions<ClamAvSettings> settings, ILogger<ClamAvService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> PingAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new TcpClient();
            await client.ConnectAsync(_settings.Host, _settings.Port, cancellationToken);
            await using var stream = client.GetStream();
            
            var pingCommand = Encoding.ASCII.GetBytes("zPING\0");
            await stream.WriteAsync(pingCommand, cancellationToken);
            
            var buffer = new byte[1024];
            var bytesRead = await stream.ReadAsync(buffer, cancellationToken);
            var response = Encoding.ASCII.GetString(buffer, 0, bytesRead).Trim('\0');
            
            return response == "PONG";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to ping ClamAV daemon");
            return false;
        }
    }

    public async Task<ClamAvScanResult> ScanFileAsync(Stream fileStream, CancellationToken cancellationToken = default)
    {
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        return await ScanFileAsync(memoryStream.ToArray(), cancellationToken);
    }

    public async Task<ClamAvScanResult> ScanFileAsync(byte[] fileBytes, CancellationToken cancellationToken = default)
    {
        var result = new ClamAvScanResult();

        try
        {
            using var client = new TcpClient();
            client.SendTimeout = _settings.TimeoutMs;
            client.ReceiveTimeout = _settings.TimeoutMs;
            
            await client.ConnectAsync(_settings.Host, _settings.Port, cancellationToken);
            await using var stream = client.GetStream();

            // Send INSTREAM command
            var command = Encoding.ASCII.GetBytes("zINSTREAM\0");
            await stream.WriteAsync(command, cancellationToken);

            // Send file data in chunks
            const int chunkSize = 2048;
            var offset = 0;

            while (offset < fileBytes.Length)
            {
                var bytesToSend = Math.Min(chunkSize, fileBytes.Length - offset);
                var sizeBytes = BitConverter.GetBytes(System.Net.IPAddress.HostToNetworkOrder(bytesToSend));
                
                await stream.WriteAsync(sizeBytes, cancellationToken);
                await stream.WriteAsync(fileBytes.AsMemory(offset, bytesToSend), cancellationToken);
                
                offset += bytesToSend;
            }

            // Send zero-length chunk to indicate end of stream
            var zeroBytes = BitConverter.GetBytes(0);
            await stream.WriteAsync(zeroBytes, cancellationToken);

            // Read response
            var responseBuffer = new byte[4096];
            var bytesRead = await stream.ReadAsync(responseBuffer, cancellationToken);
            var response = Encoding.ASCII.GetString(responseBuffer, 0, bytesRead).Trim('\0').Trim();

            result.IsScanned = true;
            result.RawResult = response;

            if (response.EndsWith("OK"))
            {
                result.IsSafe = true;
            }
            else if (response.Contains("FOUND"))
            {
                result.IsSafe = false;
                // Extract virus name from response like "stream: Eicar-Test-Signature FOUND"
                var parts = response.Split(':');
                if (parts.Length > 1)
                {
                    result.VirusName = parts[1].Replace("FOUND", "").Trim();
                }
            }
            else if (response.Contains("ERROR"))
            {
                result.IsSafe = false;
                result.Error = response;
            }

            _logger.LogInformation("ClamAV scan result: {Response}", response);
        }
        catch (SocketException ex)
        {
            _logger.LogError(ex, "Failed to connect to ClamAV daemon at {Host}:{Port}", _settings.Host, _settings.Port);
            result.Error = $"Failed to connect to ClamAV: {ex.Message}";
            result.IsScanned = false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during ClamAV scan");
            result.Error = $"Scan error: {ex.Message}";
            result.IsScanned = false;
        }

        return result;
    }
}
