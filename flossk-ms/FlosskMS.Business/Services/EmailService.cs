using FlosskMS.Business.Configuration;
using Microsoft.Extensions.Options;
using Resend;

namespace FlosskMS.Business.Services;

public class ResendEmailService(IResend resend, IOptions<ResendSettings> settings) : IEmailService
{
    private readonly IResend _resend = resend;
    private readonly ResendSettings _settings = settings.Value;

    public async Task SendPasswordResetEmailAsync(string toEmail, string toName, string resetLink)
    {
        var message = new EmailMessage
        {
            From = $"{_settings.FromName} <{_settings.FromEmail}>",
            Subject = "Reset your password",
            HtmlBody = EmailTemplates.PasswordReset(_settings.FromName, toName, resetLink)
        };
        message.To.Add(toEmail);
        await _resend.EmailSendAsync(message);
    }
}
