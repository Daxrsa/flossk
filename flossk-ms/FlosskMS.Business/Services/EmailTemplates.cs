namespace FlosskMS.Business.Services;

internal static class EmailTemplates
{
    public static string PasswordReset(string appName, string toName, string resetLink) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px 0;">
            <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08);">
                <div style="background: #ECB91C; padding: 32px 40px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px;">{appName}</h1>
                </div>
                <div style="padding: 40px;">
                    <h2 style="margin-top: 0; color: #1e293b;">Reset your password</h2>
                    <p style="color: #475569;">Hi {toName},</p>
                    <p style="color: #475569;">We received a request to reset the password for your account. Click the button below to choose a new password.</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{resetLink}"
                           style="background: #ECB91C; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #ECB91C; font-size: 13px;">This link expires in 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """;
}
