namespace FlosskMS.Business.Configuration;

public class SmtpSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    /// <summary>For Gmail use an App Password, not your account password.</summary>
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "FlosskMS";
    public string FrontendBaseUrl { get; set; } = "http://localhost:4200";
}
