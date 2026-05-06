using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record JoinRequestDto(
    string Id,
    string GroupId,
    string GroupName,
    string StudentId,
    string StudentName,
    JoinRequestStatus Status,
    DateTime RequestedAt
);

    public record CreateJoinRequestDto(
        string GroupId
    );

    public record ReviewJoinRequestDto(
        bool Accept
    );

}
