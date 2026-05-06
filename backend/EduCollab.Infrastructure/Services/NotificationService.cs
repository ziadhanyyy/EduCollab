using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Domain.Enums;
using EduCollab.Infrastructure.Data;
using EduCollab.Infrastructure.Hubs;
using EduCollab.Infrastructure.Hubs.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _notifHub;
        private readonly IHubContext<GroupHub, IGroupHubClient> _groupHub;

        public NotificationService(
            AppDbContext context,
            IHubContext<NotificationHub> notifHub,
            IHubContext<GroupHub, IGroupHubClient> groupHub)
        {
            _context = context;
            _notifHub = notifHub;
            _groupHub = groupHub;
        }
        public async Task CreateAndSendAsync(string userId, string? groupId, string message, NotificationType type)
        {
            var uid = Guid.Parse(userId);

            var notification = new Notification
            {
                UserId = uid,
                GroupId =  !string.IsNullOrEmpty(groupId) ? Guid.Parse(groupId) :(Guid?)null,
                Message = message,
                Type = type
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(); 
            var noti = _context.Notifications.FirstOrDefault(notification);
            var ndto = new NotificationDto(
                noti.Id.ToString(),
                noti.Message,
                noti.Type,
                noti.GroupId.HasValue ? noti.GroupId.ToString() : null,
                noti.IsRead,
                noti.CreatedAt
            );


            await _notifHub.Clients.User(userId).SendAsync("Notify", ndto);

        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string Id)
        {
            var uid = Guid.Parse(Id);
            return await _context.Notifications.Where(u => u.Id == uid)
                .OrderByDescending(u => u.CreatedAt)
                .Select(n => new NotificationDto(
                    n.Id.ToString(),
                    n.Message,
                    n.Type,
                    n.GroupId.HasValue ? n.GroupId.ToString() : null,
                    n.IsRead,
                    n.CreatedAt
                )).ToListAsync();
        }

        public async  Task<bool> MarkAllAsReadAsync(string userId)
        {
            var guid = Guid.Parse(userId);
            await _context.Notifications
                .Where(n => n.UserId == guid && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
            return true;
        }

        public async  Task NotifyMaterialUploadedAsync(string groupId, string uploaderName, StudyMaterialDto material)
        {
            var members= await _context.GroupMembers.Where(g=>g.Id.ToString() == groupId && g.UserId.ToString() != material.UploaderId)
                         .Select(g=>g.UserId)
                         .ToListAsync();
            var msg = $"{uploaderName} uploaded '{material.OriginalFileName}'.";
            foreach(var  userId in members)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = userId,
                    GroupId = Guid.Parse(groupId),
                    Message = msg,
                    Type = NotificationType.NewMaterial
                });
               await _context.SaveChangesAsync();
                await _groupHub.Clients.Group(groupId).MaterialUploaded(material);

            }
        }

        public async Task NotifyMessageAsync(string groupId, MessageDto message)
        {
            await _groupHub.Clients.Group(groupId).ReceiveMessage(message);
        }

        public async Task SendMeetingRemindersAsync(string groupId, MeetingDto meeting)
        {
            var members=  await _context.GroupMembers.Where(g=>g.Id.ToString()==groupId)
                .Select(g=>g.UserId).ToListAsync();
            var reminderMsg = meeting.MeetingUrl != null
           ? $"Meeting '{meeting.Title}' starts in 1 hour. Join: {meeting.MeetingUrl}"
           : $"Meeting '{meeting.Title}' starts in 1 hour at: {meeting.OfflineAddress}";
            foreach (var userId in members) {

                _context.Notifications.Add(new Notification
                {
                    UserId = userId,
                    GroupId = Guid.Parse(groupId),
                    Message = reminderMsg,
                    Type = NotificationType.MeetingReminder
                });
            }

            await _context.SaveChangesAsync();

            await _groupHub.Clients.Group(groupId).MeetingReminder(meeting);
        }
    }
}
