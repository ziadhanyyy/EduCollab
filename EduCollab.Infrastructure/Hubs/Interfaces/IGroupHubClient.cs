using EduCollab.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Hubs.Interfaces
{
    public interface IGroupHubClient
    {
        Task ReceiveMessage(MessageDto message);
        Task MeetingReminder(MeetingDto meeting);
        Task MemberJoined(UserDto user);
        Task MemberLeft(string userId);
        Task MaterialUploaded(StudyMaterialDto material);
    }
}
