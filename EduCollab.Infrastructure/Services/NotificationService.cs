using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        public Task CreateAndSendAsync(string userId, int? groupId, string message, NotificationType type)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string Id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> MarkAllAsReadAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task NotifyMaterialUploadedAsync(int groupId, string uploaderName, StudyMaterialDto material)
        {
            throw new NotImplementedException();
        }

        public Task NotifyMessageAsync(int groupId, MessageDto message)
        {
            throw new NotImplementedException();
        }

        public Task SendMeetingRemindersAsync(int groupId, MeetingDto meeting)
        {
            throw new NotImplementedException();
        }
    }
}
