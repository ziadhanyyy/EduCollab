using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduCollab.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupService _groupService;
        public GroupsController(IGroupService groupService) => _groupService = groupService;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // Public — browse without login
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] GroupSearchDto filter)
            => Ok(await _groupService.SearchGroupsAsync(filter));

        [HttpGet("{groupId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(string groupId)
        {
            var g = await _groupService.GetGroupByIdAsync(groupId);
            return g == null ? NotFound() : Ok(g);
        }

        // Auth required from here
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> MyGroups()
            => Ok(await _groupService.GetUserGroupsAsync(UserId));

        [HttpPost]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Create([FromBody] CreateGroupDto dto)
            => Ok(await _groupService.CreateGroupAsync(UserId, dto));

        [HttpPut("{groupId}")]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Update(string groupId, [FromBody] UpdateGroupDto dto)
            => Ok(await _groupService.UpdateGroupAsync(groupId, UserId, dto));

        [HttpDelete("{groupId}")]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Delete(string groupId)
            => Ok(new { success = await _groupService.DeleteGroupAsync(groupId, UserId) });

        // Join requests
        [HttpPost("join")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> RequestJoin([FromBody] CreateJoinRequestDto dto)
            => Ok(await _groupService.RequestJoinAsync(UserId, dto));

        [HttpGet("{groupId}/join-requests")]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> GetJoinRequests(string groupId)
            => Ok(await _groupService.GetGroupJoinRequestsAsync(groupId, UserId));

        [HttpPost("join-requests/{requestId}/review")]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> ReviewJoinRequest(string requestId, [FromBody] ReviewJoinRequestDto dto)
            => Ok(await _groupService.ReviewJoinRequestAsync(requestId, UserId, dto.Accept));

        [HttpPost("{groupId}/leave")]
        [Authorize]
        public async Task<IActionResult> Leave(string groupId)
            => Ok(new { success = await _groupService.LeaveGroupAsync(groupId, UserId) });
    }
}
