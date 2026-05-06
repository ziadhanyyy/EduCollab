using EduCollab.Application.DTOs;
using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string Id);
        Task<bool> MarkAllAsReadAsync(string userId);
        Task CreateAndSendAsync(string userId, string? groupId, string message, NotificationType type);
        Task SendMeetingRemindersAsync(string groupId, MeetingDto meeting);
        Task NotifyMaterialUploadedAsync(string groupId, string uploaderName, StudyMaterialDto material);
        Task NotifyMessageAsync(string groupId, MessageDto message);
    }
}
