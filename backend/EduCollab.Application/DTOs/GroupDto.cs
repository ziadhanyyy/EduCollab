using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record GroupDto(
    string Id,
    string Name,
    string Subject,
    string? Description,
    int MaxMembers,
    MeetingType MeetingType,
    string? OnlineLink,
    string? OfflineAddress,
    DateTime? MeetingSchedule,
    GroupApprovalStatus ApprovalStatus,
    string CreatorId,
    string CreatorName,
    DateTime CreatedAt,
    int MemberCount
);

    public record CreateGroupDto(
        string Name,
        string Subject,
        string? Description,
        int MaxMembers = 50,
        MeetingType MeetingType = MeetingType.Online,
        string? OnlineLink = null,
        string? OfflineAddress = null,
        DateTime? MeetingSchedule = null
    );

    public record UpdateGroupDto(
        string? Name,
        string? Subject,
        string? Description,
        int? MaxMembers,
        MeetingType? MeetingType,
        string? OnlineLink,
        string? OfflineAddress,
        DateTime? MeetingSchedule
    );

    public record GroupSearchDto(
        string? Subject,
        string? Location,
        DateTime? MeetingSchedule,
        int Page = 1,
        int PageSize = 20
    );
}
