using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record MessageDto(
    string Id,
    string GroupId,
    string SenderId,
    string SenderName,
    string Content,
    DateTime SentAt
);

    public record SendMessageDto(
        string GroupId,
        string Content
    );
}
