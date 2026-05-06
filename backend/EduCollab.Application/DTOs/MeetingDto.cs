using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record MeetingDto(
    string Id,
    string GroupId,
    string Title,
    string? Description,
    DateTime ScheduledAt,
    int DurationMinutes,
    string? MeetingUrl,
    string? OfflineAddress,
    MeetingStatus Status,
    string OrganizerId,
    string OrganizerName,
    DateTime CreatedAt
);

    public record CreateMeetingDto(
        string GroupId,
        string Title,
        string? Description,
        DateTime ScheduledAt,
        int DurationMinutes = 60,
        string? MeetingUrl = null,
        string? OfflineAddress = null
    );

    public record UpdateMeetingDto(
        string? Title,
        string? Description,
        DateTime? ScheduledAt,
        int? DurationMinutes,
        string? MeetingUrl,
        string? OfflineAddress,
        MeetingStatus? Status
    );

}
