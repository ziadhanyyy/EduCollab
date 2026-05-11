using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record NotificationDto(
    string Id,
    string Message,
    NotificationType Type,
    string? GroupId,
    bool IsRead,
    DateTime CreatedAt
);
}
