using EduCollab.Application.Common.Exceptions;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Domain.Enums;
using EduCollab.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public AdminService(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager= userManager;
        }
        public async Task<bool> ApproveCreatorAsync(string creatorId)
        {
            if (string.IsNullOrWhiteSpace(creatorId))
                throw new BadRequestException("Creator id is required.");

            var user = await _userManager.FindByIdAsync(creatorId);
            if (user == null)
                throw new NotFoundException("Creator not found.");

            if (user.CreatorApprovalStatus != CreatorApprovalStatus.Pending)
                throw new ConflictException("Creator is not pending.");

            user.CreatorApprovalStatus = CreatorApprovalStatus.Approved;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new ConflictException("something wrong");

            return true;
        }

        public async Task<GroupDto?> ApproveGroupAsync(string groupId)
        {
            if (!Guid.TryParse(groupId,out var gid))
                throw new BadRequestException("Invalid group id.");

            var g = await _context.Groups
                .Include(x => x.Members)
                .Include(x => x.Creator)
                .FirstOrDefaultAsync(x => x.Id == gid);

            if (g == null)
                throw new NotFoundException("Group not found.");

            if (g.ApprovalStatus != GroupApprovalStatus.Pending)
                throw new ConflictException("Group is not pending.");

            g.ApprovalStatus = GroupApprovalStatus.Approved;
            await _context.SaveChangesAsync();

            return new GroupDto(
                g.Id.ToString(), g.Name, g.Subject, g.Description, g.MaxMembers,
                g.MeetingType, g.OnlineLink, g.OfflineAddress, g.MeetingSchedule,
                g.ApprovalStatus, g.CreatorId.ToString(), g.Creator.DisplayName,
                g.CreatedAt, g.Members.Count
            );
        }

        public async Task<IEnumerable<PendingCreatorDto>> GetPendingCreatorsAsync()
        {
            return await _context.Users.Where(u=>u.CreatorApprovalStatus==CreatorApprovalStatus.Pending)
                .Select(u=>new PendingCreatorDto( u.Id.ToString(),
                u.UserName,u.Email,u.DisplayName,u.CreatedAt)).ToListAsync(); 
        }

        public async Task<IEnumerable<GroupDto>> GetPendingGroupsAsync()
        {
            return await _context.Groups.Include(g=>g.Creator).Include(g=>g.Members).Where(g => g.ApprovalStatus == GroupApprovalStatus.Pending)
                .Select(g => new GroupDto(g.Id.ToString(), g.Name, g.Subject,g.Description, g.MaxMembers
                , g.MeetingType, g.OnlineLink, g.OfflineAddress, g.MeetingSchedule,
                g.ApprovalStatus, g.CreatorId.ToString(), g.Creator.DisplayName, g.CreatedAt, g.Members.Count)).ToListAsync();
                
        }

        public async Task<bool> RejectCreatorAsync(string creatorId)
        {
            if (string.IsNullOrWhiteSpace(creatorId))
                throw new BadRequestException("Creator id is required.");

            var user = await _userManager.FindByIdAsync(creatorId);
            if (user == null)
                throw new NotFoundException("Creator not found.");

            if (user.CreatorApprovalStatus != CreatorApprovalStatus.Pending)
                throw new ConflictException("Creator is not pending.");

            user.CreatorApprovalStatus = CreatorApprovalStatus.Rejected;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new ConflictException("something wrong");

            return true;
        }

        public async Task<GroupDto?> RejectGroupAsync(string groupId)
        {
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid group id.");

            var g = await _context.Groups
                .Include(x => x.Members)
                .Include(x => x.Creator)
                .FirstOrDefaultAsync(x => x.Id == gid);

            if (g == null)
                throw new NotFoundException("Group not found.");

            if (g.ApprovalStatus != GroupApprovalStatus.Pending)
                throw new ConflictException("Group is not pending.");

            g.ApprovalStatus = GroupApprovalStatus.Approved;
            await _context.SaveChangesAsync();

            return new GroupDto(
                g.Id.ToString(), g.Name, g.Subject, g.Description, g.MaxMembers,
                g.MeetingType, g.OnlineLink, g.OfflineAddress, g.MeetingSchedule,
                g.ApprovalStatus, g.CreatorId.ToString(), g.Creator.DisplayName,
                g.CreatedAt, g.Members.Count
            );
        }
    }
}
