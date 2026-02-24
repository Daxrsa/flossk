namespace FlosskMS.Business.Configuration;

public class ResendSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@yourdomain.com";
    public string FromName { get; set; } = "FlosskMS";
    public string FrontendBaseUrl { get; set; } = "http://localhost:4200";
}
