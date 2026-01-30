namespace FlosskMS.Business.DTOs;

public class UpdateUserDto
{
    public string? Biography { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Location { get; set; }
    public string? WebsiteUrl { get; set; }
    public List<string>? SocialLinks { get; set; }
    public bool RFID { get; set; }
    public List<string>? Skills { get; set; }
}
