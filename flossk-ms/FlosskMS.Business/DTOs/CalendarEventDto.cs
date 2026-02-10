namespace FlosskMS.Business.DTOs;

public class CalendarEventDto
{
    public Guid Id { get; set; }
    public string CalendarUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public string CreatedByFirstName { get; set; } = string.Empty;
    public string CreatedByLastName { get; set; } = string.Empty;
}

public class CreateCalendarEventDto
{
    public string CalendarUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
}

public class UpdateCalendarEventDto
{
    public string CalendarUrl { get; set; } = string.Empty;
    public string? Title { get; set; }
}
