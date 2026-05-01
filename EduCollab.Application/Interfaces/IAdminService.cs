using EduCollab.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
    public interface  IAdminService
    {
        Task<IEnumerable<PendingCreatorDto>> GetPendingCreatorsAsync();
        Task<bool> ApproveCreatorAsync(string creatorId);
        Task<bool> RejectCreatorAsync(string creatorId);
        Task<IEnumerable<GroupDto>> GetPendingGroupsAsync();
        Task<GroupDto?> ApproveGroupAsync(string groupId);
        Task<GroupDto?> RejectGroupAsync(string groupId);
    }
}
