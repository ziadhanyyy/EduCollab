using EduCollab.Application.Common.Exceptions;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Domain.Enums;
using EduCollab.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduCollab.Infrastructure.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly AppDbContext _context;
       public MeetingService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<MeetingDto> CreateMeetingAsync(string organizerId, CreateMeetingDto dto)

        { var gid = Guid.Parse(dto.GroupId);
            if (!Guid.TryParse(organizerId, out var uid))
                throw new BadRequestException("Invalid organizer id.");
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new BadRequestException("Title is required.");

            if (dto.DurationMinutes <= 0 )
                throw new BadRequestException("DurationMinutes must be bigger than zero.");

            if (dto.ScheduledAt <= DateTime.UtcNow)
                throw new BadRequestException("ScheduledAt must be in the future.");

            bool hasUrl = !string.IsNullOrWhiteSpace(dto.MeetingUrl);
            bool hasAddress = !string.IsNullOrWhiteSpace(dto.OfflineAddress);

            if (!hasUrl && !hasAddress)
                throw new BadRequestException("Provide MeetingUrl (online) or OfflineAddress (offline).");

            if (hasUrl && hasAddress)
                throw new BadRequestException("Provide either MeetingUrl or OfflineAddress, not both.");

            var groupExists = await _context.Groups.AnyAsync(g => g.Id == gid);
            if (!groupExists)
                throw new NotFoundException("Group not found.");

            var isMember = await _context.GroupMembers.AnyAsync(gm => gm.GroupId == gid && gm.UserId == uid);
            if (!isMember)
                throw new ForbiddenException("You are not a member of this group.");
            var start = dto.ScheduledAt;
            var end = dto.ScheduledAt.AddMinutes(dto.DurationMinutes);
            var overlaps = await _context.Meetings.AnyAsync(m =>
                m.GroupId == gid &&
                m.Status == MeetingStatus.Scheduled &&
                start < m.ScheduledAt.AddMinutes(m.DurationMinutes) &&
                end > m.ScheduledAt);

            if (overlaps)
                throw new ConflictException("This meeting overlaps with another scheduled meeting.");
            var meet = new Meeting
            {
                GroupId = gid,
                Title = dto.Title,
                Description = dto.Description,
                CreatedAt=DateTime.Now,
                MeetingUrl = hasUrl ? dto.MeetingUrl : null,
                OfflineAddress = hasAddress ? dto.OfflineAddress : null,
                DurationMinutes =dto.DurationMinutes,
                ScheduledAt=dto.ScheduledAt,
                OrganizerId=uid,
                Status = MeetingStatus.Scheduled

            };
           await _context.Meetings.AddAsync(meet);
           await _context.SaveChangesAsync();

            var m = await  _context.Meetings.Include(x => x.Organizer).FirstOrDefaultAsync(x => x.Id == meet.Id);
            if (m == null)
                throw new BadRequestException("couldnt save to DB");
            return  new MeetingDto(
            Id: m.Id.ToString(),
            GroupId: m.GroupId.ToString(),
            Title: m.Title,
            Description: m.Description,
            ScheduledAt: m.ScheduledAt,
            DurationMinutes: m.DurationMinutes,
            MeetingUrl: m.MeetingUrl,
            OfflineAddress: m.OfflineAddress,
            Status: m.Status,
            OrganizerId: m.OrganizerId.ToString(),
            OrganizerName: m.Organizer.DisplayName ,
            CreatedAt: m.CreatedAt);
        }

        public async Task<bool> DeleteMeetingAsync(string meetingId, string userId)
        {
            var meet = await _context.Meetings.FirstOrDefaultAsync(u => u.Id == Guid.Parse(meetingId));
            if (meet == null)
                throw new NotFoundException("Meeting not found");
            if(!Guid.TryParse(userId,out var uid))
                 throw new BadRequestException("Invalid user id.");
            if(meet.OrganizerId != uid)
                throw new ForbiddenException("The organizer only can delete the meeting");
             _context.Meetings.Remove(meet);
            await _context.SaveChangesAsync();
            return true;

        }


        public async Task<IEnumerable<MeetingDto>> GetGroupMeetingsAsync(string groupId)
        {
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid Group Id");
            var e = await _context.Groups.AnyAsync(g => g.Id == gid);
            if (!e)
                throw new NotFoundException("Group not found.");
            return await _context.Meetings
        .Where(m => m.GroupId == gid)
        .OrderBy(m => m.ScheduledAt)
        .Select(m => new MeetingDto(
            m.Id.ToString(),                  
            m.GroupId.ToString(),              
            m.Title,                           
            m.Description,                   
            m.ScheduledAt,                   
            m.DurationMinutes,                 
            m.MeetingUrl,                    
            m.OfflineAddress,                  
            m.Status,                          
            m.OrganizerId.ToString(),          
            m.Organizer.DisplayName,
            m.CreatedAt
        )).ToListAsync();
        }

        public async Task<MeetingDto> GetMeetingByIdAsync(string meetingId)
        {
            if (!Guid.TryParse(meetingId, out var mid))
                throw new  BadRequestException("Invalid Meeting ID");
            var m = await _context.Meetings
           .Include(x => x.Organizer)
           .FirstOrDefaultAsync(x => x.Id == mid);

            if (m == null)
                throw new NotFoundException("Meeting not found.");

            return new MeetingDto(
            Id: m.Id.ToString(),
            GroupId: m.GroupId.ToString(),
            Title: m.Title,
            Description: m.Description,
            ScheduledAt: m.ScheduledAt,
            DurationMinutes: m.DurationMinutes,
            MeetingUrl: m.MeetingUrl,
            OfflineAddress: m.OfflineAddress,
            Status: m.Status,
            OrganizerId: m.OrganizerId.ToString(),
            OrganizerName: m.Organizer.DisplayName,
            CreatedAt: m.CreatedAt);
        }

        public Task<IEnumerable<MeetingDto>> GetUpcomingMeetingsAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<MeetingDto> UpdateMeetingAsync(string meetingId, string userId, UpdateMeetingDto dto)
        {
            if(!Guid.TryParse(meetingId, out var mid))
            
               throw new BadRequestException("Invalid meeting id.");

            if (!Guid.TryParse(userId, out var uid))

                throw new BadRequestException("Invalid userId id.");
            var meeting = await _context.Meetings.Include(u=>u.Organizer).FirstOrDefaultAsync(u=>u.Id==mid);

            if (meeting == null)
                throw new NotFoundException("Meeting not found.");
            if (meeting.OrganizerId != uid)
                throw new ForbiddenException("Only the meeting organizer can update this meeting.");
            if (dto.Title != null)
            {
                if (string.IsNullOrWhiteSpace(dto.Title))
                    throw new BadRequestException("Title cannot be empty.");
                meeting.Title = dto.Title.Trim();
            }

            if (dto.Description != null)
                meeting.Description = dto.Description;

            if (dto.DurationMinutes.HasValue)
            {
                if (dto.DurationMinutes.Value <= 0)
                    throw new BadRequestException("DurationMinutes must be more than zero.");
                meeting.DurationMinutes = dto.DurationMinutes.Value;
            }

            if (dto.ScheduledAt.HasValue)
            {
                if (dto.ScheduledAt.Value <= DateTime.UtcNow)
                    throw new BadRequestException("ScheduledAt must be in the future.");
                meeting.ScheduledAt = dto.ScheduledAt.Value;
            }

            if (dto.MeetingUrl != null)
                meeting.MeetingUrl = string.IsNullOrWhiteSpace(dto.MeetingUrl) ? null : dto.MeetingUrl;

            if (dto.OfflineAddress != null)
                meeting.OfflineAddress = string.IsNullOrWhiteSpace(dto.OfflineAddress) ? null : dto.OfflineAddress;

            var hasUrl = !string.IsNullOrWhiteSpace(meeting.MeetingUrl);
            var hasAddress = !string.IsNullOrWhiteSpace(meeting.OfflineAddress);

            if (!hasUrl && !hasAddress)
                throw new BadRequestException("Meeting must have MeetingUrl or OfflineAddress.");

            if (hasUrl && hasAddress)
                throw new BadRequestException("Meeting cannot have both MeetingUrl and OfflineAddress.");

            if (dto.Status.HasValue)
            {
                var newStatus = dto.Status.Value;
                if ((meeting.Status == MeetingStatus.Cancelled || meeting.Status == MeetingStatus.Completed) &&
                    newStatus == MeetingStatus.Scheduled)
                    throw new ConflictException("Cannot change status back to Scheduled.");

                meeting.Status = newStatus;
            }
            var start = meeting.ScheduledAt;
            var end = meeting.ScheduledAt.AddMinutes(meeting.DurationMinutes);
            var overlaps = await _context.Meetings.AnyAsync(x =>
                x.Id != meeting.Id &&
                x.GroupId == meeting.GroupId &&
                x.Status == MeetingStatus.Scheduled &&
                start < x.ScheduledAt.AddMinutes(x.DurationMinutes) &&
                end > x.ScheduledAt);

            if (overlaps)
                throw new ConflictException("This meeting overlaps with another scheduled meeting.");

            await _context.SaveChangesAsync();
            return new MeetingDto(
            Id: meeting.Id.ToString(),
            GroupId: meeting.GroupId.ToString(),
            Title: meeting.Title,
            Description: meeting.Description,
            ScheduledAt: meeting.ScheduledAt,
            DurationMinutes: meeting.DurationMinutes,
            MeetingUrl: meeting.MeetingUrl,
            OfflineAddress: meeting.OfflineAddress,
            Status: meeting.Status,
            OrganizerId: meeting.OrganizerId.ToString(),
            OrganizerName: meeting.Organizer.DisplayName,
            CreatedAt: meeting.CreatedAt);

        }
    }
}
