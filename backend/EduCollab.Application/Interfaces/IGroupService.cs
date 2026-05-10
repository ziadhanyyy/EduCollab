using EduCollab.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
    public interface IGroupService
    {
        Task<IEnumerable<GroupDto>> GetUserGroupsAsync(string userId);
        Task<IEnumerable<GroupDto>> SearchGroupsAsync(GroupSearchDto filter);
        Task<GroupDto?> GetGroupByIdAsync(string groupId);
        Task<GroupDto> CreateGroupAsync(string ownerId, CreateGroupDto dto);
        Task<GroupDto?> UpdateGroupAsync(string groupId, string userId, UpdateGroupDto dto);
        Task<bool> DeleteGroupAsync(string groupId, string userId);
        Task<JoinRequestDto> RequestJoinAsync(string studentId, CreateJoinRequestDto dto);
        Task<IEnumerable<JoinRequestDto>> GetMyJoinRequestsAsync(string studentId);
        Task<IEnumerable<JoinRequestDto>> GetGroupJoinRequestsAsync(string groupId, string creatorId);
        Task<JoinRequestDto?> ReviewJoinRequestAsync(string requestId, string creatorId, bool accept);
        Task<bool> LeaveGroupAsync(string groupId, string userId);
    }
}
