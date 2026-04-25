using EduCollab.Application.Common.Exceptions;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Services
{
    public class MessageService : IMessageService
    {
        private readonly AppDbContext _context;
        public MessageService(AppDbContext context)
        {
            _context = context;
        }

        public async  Task<bool> DeleteMessageAsync(string messageId, string userId)
        {
            var uId = Guid.Parse(userId);
            var mId = Guid.Parse(messageId);
            var message = await _context.Messages.FindAsync(mId);
            if (message == null)
                throw new NotFoundException("Message not found.");
            if (message.SenderId != uId)
                throw new ForbiddenException("You cannot delete this message.");
            message.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MessageDto>> GetGroupMessagesAsync(string groupId, int page = 1, int pageSize = 50)
        {
            var gId = Guid.Parse(groupId);
            var groupExists = await _context.Groups.AnyAsync(g => g.Id == gId);
            if (!groupExists)
                throw new NotFoundException("Group not found.");
            return await _context.Messages.Where(m => m.GroupId == gId && !m.IsDeleted)
                  .Include(m => m.Sender)
                  .OrderByDescending(m => m.SentAt)
                  .Skip((page - 1) * pageSize).Take(pageSize)
                  .Select(m => new MessageDto(m.Id.ToString(), m.GroupId.ToString(), m.SenderId.ToString(),
                m.Sender.DisplayName,  m.Content, m.SentAt))
            .ToListAsync();
            ;
        }

        public async Task<MessageDto> SendMessageAsync(string senderId, SendMessageDto dto)
        {
            var uid = Guid.Parse(senderId);
            var gid =Guid.Parse(dto.GroupId);
            var sender = await _context.Users.FindAsync(uid);
            if(sender == null)
            {
                throw new UnauthorizedAccessException("User Not Found.");
            }
            var groupExists = await _context.Groups.AnyAsync(g => g.Id == gid);
            if (!groupExists)
            {
                throw new NotFoundException("Group Not Found.");
            }
            var isMember = await _context.GroupMembers.AnyAsync(gm => gm.GroupId == gid && gm.UserId == uid);
            if (!isMember)
            { throw new ForbiddenException("You are not a member of this group."); }

            var messsage = new Message
            {
                GroupId = Guid.Parse(dto.GroupId),
                SenderId = uid,
                Content = dto.Content
            };
            _context.Messages.Add(messsage);
            await _context.SaveChangesAsync();
            return new MessageDto(messsage.Id.ToString(), messsage.GroupId.ToString(), messsage.SenderId.ToString(),
                sender?.DisplayName ?? string.Empty,
                messsage.Content,messsage.SentAt);
        }
    }
}
