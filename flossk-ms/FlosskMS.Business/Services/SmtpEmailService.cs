using FlosskMS.Business.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace FlosskMS.Business.Services;

public class SmtpEmailService(IOptions<SmtpSettings> settings) : IEmailService
{
    private readonly SmtpSettings _settings = settings.Value;

    public async Task SendPasswordResetEmailAsync(string toEmail, string toName, string resetLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = "Reset your password";

        message.Body = new BodyBuilder
        {
            HtmlBody = EmailTemplates.PasswordReset(_settings.FromName, toName, resetLink)
        }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_settings.Username, _settings.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
