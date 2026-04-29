using EduCollab.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
    public interface IMeetingService
    {
        Task<IEnumerable<MeetingDto>> GetGroupMeetingsAsync(string groupId);
        Task<IEnumerable<MeetingDto>> GetUpcomingMeetingsAsync();
        Task<MeetingDto> GetMeetingByIdAsync(string meetingId);
        Task<MeetingDto> CreateMeetingAsync(string organizerId, CreateMeetingDto dto);
        Task<MeetingDto> UpdateMeetingAsync(string meetingId, string userId, UpdateMeetingDto dto);
        Task<bool> DeleteMeetingAsync(string meetingId, string userId);
    }

}
