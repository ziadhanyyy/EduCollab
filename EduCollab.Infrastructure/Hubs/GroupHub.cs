using EduCollab.Infrastructure.Data;
using EduCollab.Infrastructure.Hubs.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Infrastructure.Hubs
{
    [Authorize]
    public class GroupHub : Hub<IGroupHubClient>
    {
        private readonly AppDbContext _db;

        public GroupHub(AppDbContext db) => _db = db;

        public async Task JoinGroup(string groupId)
        {
            if (!Guid.TryParse(groupId, out var gId))
                throw new HubException("Invalid group id.");

            var userIdStr = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var uId))
                throw new HubException("Unauthorized.");
            var isMember = await _db.GroupMembers.AnyAsync(gm => gm.GroupId == gId && gm.UserId == uId);
            if (!isMember)
                throw new HubException("You are not a member of this group.");

            await Groups.AddToGroupAsync(Context.ConnectionId, groupId);
        }

        public async Task LeaveGroup(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }
    }
}
