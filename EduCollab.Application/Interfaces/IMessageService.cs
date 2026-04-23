using EduCollab.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
    public interface IMessageService
    {
        Task<IEnumerable<MessageDto>> GetGroupMessagesAsync(string groupId, int page = 1, int pageSize = 50);
        Task<MessageDto> SendMessageAsync(string senderId, SendMessageDto dto);
        Task<bool> DeleteMessageAsync(string messageId, string userId);
    }
}
