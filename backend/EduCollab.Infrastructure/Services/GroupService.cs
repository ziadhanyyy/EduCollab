using EduCollab.Application.Common.Exceptions;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Domain.Enums;
using EduCollab.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Services
{
    public class GroupService : IGroupService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public GroupService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
        public async Task<GroupDto> CreateGroupAsync(string ownerId, CreateGroupDto dto)
        {
            if (!Guid.TryParse(ownerId, out Guid uid))
                throw new BadRequestException("Invalid user id.");
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new BadRequestException("Group name is required.");

            if (string.IsNullOrWhiteSpace(dto.Subject))
                throw new BadRequestException("Subject is required.");

            if (dto.MaxMembers <= 0)
                throw new BadRequestException("MaxMembers must be greater than 0.");
            if (dto.MeetingType == MeetingType.Online && string.IsNullOrWhiteSpace(dto.OnlineLink))
                throw new BadRequestException("OnlineLink is required for online groups.");

            if (dto.MeetingType == MeetingType.Offline && string.IsNullOrWhiteSpace(dto.OfflineAddress))
                throw new BadRequestException("OfflineAddress is required for offline groups.");
            var duplicate = await _context.Groups.AnyAsync(g => g.CreatorId == uid && g.Name == dto.Name);
            if (duplicate)
                throw new ConflictException("You already created a group with the same name.");
            var group = new Group
            {
                Name = dto.Name.Trim(),
                Subject = dto.Subject.Trim(),
                Description = dto.Description,
                MaxMembers = dto.MaxMembers,
                MeetingType = dto.MeetingType,
                OnlineLink = dto.OnlineLink,
                OfflineAddress = dto.OfflineAddress,
                MeetingSchedule = dto.MeetingSchedule,
                CreatorId = uid,
                ApprovalStatus = GroupApprovalStatus.Pending
            };
           await _context.Groups.AddAsync(group);
            await _context.SaveChangesAsync();
            
            await _context.GroupMembers.AddAsync(new GroupMember
            {
                GroupId=group.Id,
                UserId=uid,
                Role=GroupRole.Owner
            });
            await _context.SaveChangesAsync();
            var created = await _context.Groups
             .Include(g => g.Creator)
            .Include(g => g.Members)
            .FirstAsync(g => g.Id == group.Id);

            await _notificationService.NotifyAdminsAsync(
                created.Id.ToString(),
                $"{created.Creator!.DisplayName} submitted a new group '{created.Name}' for review.",
                NotificationType.NewGroupPendingReview);

             return new GroupDto(
                        created.Id.ToString(),
                        created.Name,
                        created.Subject,
                        created.Description,
                        created.MaxMembers,
                        created.MeetingType,
                        created.OnlineLink,
                        created.OfflineAddress,
                        created.MeetingSchedule,
                        created.ApprovalStatus,
                        created.CreatorId.ToString(),
                        created.Creator!.DisplayName,   
                        created.CreatedAt,
                        created.Members.Count);
        }

        public  async Task<bool> DeleteGroupAsync(string groupId, string userId)
        {
            if(!Guid.TryParse(userId, out var uid))
                 throw new BadRequestException("Invalid user id.");
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid Group id.");

            var g = await _context.Groups.FirstOrDefaultAsync(x => x.Id == gid);
            if (g == null)
                throw new NotFoundException("Group not found.");

            if (g.CreatorId != uid)
                throw new ForbiddenException("Only the group creator can delete this group.");

             _context.Groups.Remove(g);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<GroupDto?> GetGroupByIdAsync(string groupId)
        {
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid Group id.");
            var created = await _context.Groups
             .Include(g => g.Creator)
            .Include(g => g.Members)
            .FirstOrDefaultAsync(g => g.Id == gid);
            if (created == null)
                throw new NotFoundException("Group not found.");
            return new GroupDto(
                       created.Id.ToString(),
                       created.Name,
                       created.Subject,
                       created.Description,
                       created.MaxMembers,
                       created.MeetingType,
                       created.OnlineLink,
                       created.OfflineAddress,
                       created.MeetingSchedule,
                       created.ApprovalStatus,
                       created.CreatorId.ToString(),
                       created.Creator.DisplayName,
                       created.CreatedAt,
                       created.Members.Count);
        }

        public async Task<IEnumerable<JoinRequestDto>> GetMyJoinRequestsAsync(string studentId)
        {
            if (!Guid.TryParse(studentId, out var uid))
                throw new BadRequestException("Invalid user id.");

            return await _context.JoinRequests
                .Include(jr => jr.Group)
                .Where(jr => jr.StudentId == uid && jr.Status == JoinRequestStatus.Pending)
                .Select(jr => new JoinRequestDto(
                    jr.Id.ToString(),
                    jr.GroupId.ToString(),
                    jr.Group.Name,
                    jr.StudentId.ToString(),
                    studentId,
                    jr.Status,
                    jr.RequestedAt))
                .ToListAsync();
        }

        public async Task<IEnumerable<JoinRequestDto>> GetGroupJoinRequestsAsync(string groupId, string creatorId)
        {
            if (!Guid.TryParse(creatorId, out var uid))
                throw new BadRequestException("Invalid user id.");
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid Group id.");
            var g = await _context.Groups.FirstOrDefaultAsync(x => x.Id == gid);
            if (g == null)
                throw new NotFoundException("Group not found.");

            if (g.CreatorId != uid)
                throw new ForbiddenException("Only the group creator can see the join requests to this group.");

           var list= await _context.JoinRequests
           .Where(jr => jr.GroupId == gid && jr.Status == JoinRequestStatus.Pending)
           .Include(jr => jr.Group)
           .Include(jr => jr.Student)
           .ToListAsync();
            return list.Select(jr => new JoinRequestDto(Id: jr.Id.ToString(),
           GroupId: jr.GroupId.ToString(), GroupName: jr.Group.Name,
           StudentId: jr.StudentId.ToString(), StudentName: jr.Student.DisplayName,
           Status: jr.Status, RequestedAt: jr.RequestedAt));
        }

        public async Task<IEnumerable<GroupDto>> GetUserGroupsAsync(string userId)
        {
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");
            
            var list = await _context.GroupMembers
           .Where(gm => gm.UserId == uid)
           .Include(gm => gm.Group).ThenInclude(g => g.Members)
           .Include(gm => gm.Group).ThenInclude(g => g.Creator)
           .Where(gm => gm.Group.ApprovalStatus == GroupApprovalStatus.Approved || gm.Role == GroupRole.Owner)
           .ToListAsync();
            return list.Select(u => new GroupDto(
                       u.Group.Id.ToString(),
                       u.Group.Name,
                        u.Group.Subject,
                        u.Group.Description,
                        u.Group.MaxMembers,
                        u.Group.MeetingType,
                       u.Group.OnlineLink,
                       u.Group.OfflineAddress,
                       u.Group.MeetingSchedule,
                       u.Group.ApprovalStatus,
                       u.Group.CreatorId.ToString(),
                       u.Group.Creator.DisplayName ,
                       u.Group.CreatedAt,
                       u.Group.Members.Count));
        }

        public async Task<bool> LeaveGroupAsync(string groupId, string userId)
        {
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid Group id.");

            var g = await _context.Groups.AnyAsync(x => x.Id == gid);
            if (!g)
                throw new NotFoundException("Group not found.");

            var m = await _context.GroupMembers
            .FirstOrDefaultAsync(gm => gm.GroupId == gid && gm.UserId == uid);

            if (m == null)
                throw new NotFoundException("You are not a member of this group.");

            if (m.Role == GroupRole.Owner)
                throw new ConflictException("Group owner cannot leave the group.");

            _context.GroupMembers.Remove(m);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<JoinRequestDto> RequestJoinAsync(string studentId, CreateJoinRequestDto dto)
        {
            if (!Guid.TryParse(studentId, out var uid))
                throw new BadRequestException("Invalid user id.");
            if (!Guid.TryParse(dto.GroupId, out var gid))
                throw new BadRequestException("Invalid Group id.");
            var exists = await _context.JoinRequests
                .AnyAsync(jr => jr.GroupId == gid && jr.StudentId == uid);
            if (exists) throw new ConflictException("Join request already exists.");
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == gid && gm.UserId == uid);
            if (isMember) throw new ConflictException("Already a member of this group.");

            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Id == gid);
            if (group == null)
                throw new NotFoundException("Group not found.");

            if (group.ApprovalStatus != GroupApprovalStatus.Approved)
                throw new ForbiddenException("You cannot join a group that is not approved.");

            var count = await _context.GroupMembers.CountAsync(gm => gm.GroupId == gid);
            if (count >= group.MaxMembers)
                throw new ConflictException("Group has reached maximum member limit.");

            var req = new JoinRequest
            {
                GroupId = gid,
                StudentId = uid,
            };

           await _context.JoinRequests.AddAsync(req);
            await _context.SaveChangesAsync();

            var result = await _context.JoinRequests
                .Include(jr => jr.Group)
                .Include(jr => jr.Student)
                .Where(jr => jr.Id == req.Id)
                .FirstAsync();

            // Notify the group creator
            await _notificationService.CreateAndSendAsync(
                result.Group.CreatorId.ToString(),
                result.GroupId.ToString(),
                $"{result.Student.DisplayName} requested to join '{result.Group.Name}'.",
                NotificationType.NewJoinRequest);

            return new JoinRequestDto(
                result.Id.ToString(),
                result.GroupId.ToString(),
                result.Group.Name,
                result.StudentId.ToString(),
                result.Student.DisplayName,
                result.Status,
                result.RequestedAt
            );
        }

        public async Task<JoinRequestDto?> ReviewJoinRequestAsync(string requestId, string creatorId, bool accept)
        {
            if (!Guid.TryParse(creatorId, out var uid))
                throw new BadRequestException("Invalid user id.");

            if (!Guid.TryParse(requestId,out var rid))
                throw new BadRequestException("Invalid request id.");

            var req = await _context.JoinRequests
                .Include(jr => jr.Group)
                .FirstOrDefaultAsync(jr => jr.Id == rid);

            if (req == null)
                throw new NotFoundException("Join request not found.");

            if (req.Group.CreatorId != uid)
                throw new ForbiddenException("Only the group creator can review join requests.");

            if (req.Status != JoinRequestStatus.Pending)
                throw new ConflictException("Join request is already reviewed.");

            if (accept)
            {
                var count = await _context.GroupMembers.CountAsync(gm => gm.GroupId == req.GroupId);
                if (count >= req.Group.MaxMembers)
                    throw new ConflictException("Group has reached maximum member limit.");

                var isMember = await _context.GroupMembers.AnyAsync(gm => gm.GroupId == req.GroupId && gm.UserId == req.StudentId);
                if (isMember)
                    throw new ConflictException("Student is already a member of this group.");

                req.Status = JoinRequestStatus.Accepted;

                 await _context.GroupMembers.AddAsync(new GroupMember
                {
                    GroupId = req.GroupId,
                    UserId = req.StudentId,
                    Role = GroupRole.Member
                });
            }
            else
            {
                req.Status = JoinRequestStatus.Rejected;
            }

            await _context.SaveChangesAsync();

            // Notify the student
            var (notifMessage, notifType) = accept
                ? ($"Your request to join '{req.Group.Name}' was accepted!", NotificationType.JoinRequestAccepted)
                : ($"Your request to join '{req.Group.Name}' was rejected.", NotificationType.JoinRequestRejected);

            await _notificationService.CreateAndSendAsync(
                req.StudentId.ToString(),
                req.GroupId.ToString(),
                notifMessage,
                notifType);

            return await _context.JoinRequests.Include(jr=>jr.Group).Include(jr=>jr.Student)
                .Where(jr => jr.Id == req.Id)
                .Select(jr => new JoinRequestDto(
                    jr.Id.ToString(),
                    jr.GroupId.ToString(),
                    jr.Group.Name,
                    jr.StudentId.ToString(),
                    jr.Student.DisplayName,
                    jr.Status,
                    jr.RequestedAt
                ))
                .FirstAsync();
        }
        

        public async Task<IEnumerable<GroupDto>> SearchGroupsAsync(GroupSearchDto filter)
        {
            var query = _context.Groups
             .Include(g => g.Members).Include(g => g.Creator)
             .Where(g => g.ApprovalStatus == GroupApprovalStatus.Approved);

            if (!string.IsNullOrWhiteSpace(filter.Subject))
                query = query.Where(g => g.Subject.Contains(filter.Subject));

            if (!string.IsNullOrWhiteSpace(filter.Location))
                query = query.Where(g => g.OfflineAddress != null && g.OfflineAddress.Contains(filter.Location));

            if (filter.MeetingSchedule.HasValue)
                query = query.Where(g => g.MeetingSchedule.HasValue &&
                    g.MeetingSchedule.Value.Date == filter.MeetingSchedule.Value.Date);

           var list= await query
                .OrderByDescending(g => g.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
            return list.Select(g => new GroupDto(
         g.Id.ToString(), g.Name, g.Subject, g.Description, g.MaxMembers,
         g.MeetingType, g.OnlineLink, g.OfflineAddress, g.MeetingSchedule,
         g.ApprovalStatus, g.CreatorId.ToString(), g.Creator.DisplayName,
         g.CreatedAt, g.Members.Count));
        }

        public async Task<GroupDto?> UpdateGroupAsync(string groupId, string userId, UpdateGroupDto dto)
        {
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid group id.");

            var g = await _context.Groups
                .Include(x => x.Members)
                .Include(x => x.Creator)
                .FirstOrDefaultAsync(x => x.Id == gid);

            if (g == null || g.CreatorId != uid)
                throw new NotFoundException("Group or user not found.");

            if (dto.Name != null) g.Name = dto.Name;
            if (dto.Subject != null) g.Subject = dto.Subject;
            if (dto.Description != null) g.Description = dto.Description;
            if (dto.MaxMembers.HasValue) g.MaxMembers = dto.MaxMembers.Value;
            if (dto.MeetingType.HasValue) g.MeetingType = dto.MeetingType.Value;
            if (dto.OnlineLink != null) g.OnlineLink = dto.OnlineLink;
            if (dto.OfflineAddress != null) g.OfflineAddress = dto.OfflineAddress;
            if (dto.MeetingSchedule.HasValue) g.MeetingSchedule = dto.MeetingSchedule;

            if (dto.MaxMembers.HasValue && g.Members.Count > g.MaxMembers)
                throw new ConflictException("MaxMembers cannot be less than current members count.");

            if (g.MeetingType == MeetingType.Online && string.IsNullOrWhiteSpace(g.OnlineLink))
                throw new BadRequestException("OnlineLink is required for online groups.");

            if (g.MeetingType == MeetingType.Offline && string.IsNullOrWhiteSpace(g.OfflineAddress))
                throw new BadRequestException("OfflineAddress is required for offline groups.");

            await _context.SaveChangesAsync();

            return new GroupDto(
                g.Id.ToString(),
                g.Name,
                g.Subject,
                g.Description,
                g.MaxMembers,
                g.MeetingType,
                g.OnlineLink,
                g.OfflineAddress,
                g.MeetingSchedule,
                g.ApprovalStatus,
                g.CreatorId.ToString(),
                g.Creator.DisplayName,
                g.CreatedAt,
                g.Members.Count
            );
        }
    }
}
