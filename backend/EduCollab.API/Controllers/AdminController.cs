using EduCollab.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EduCollab.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(Roles ="Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        public AdminController(IAdminService adminService) => _adminService = adminService;

        [HttpGet("pending-creators")]
        public async Task<IActionResult> GetPendingCreators()
            => Ok(await _adminService.GetPendingCreatorsAsync());

        [HttpPost("creators/{creatorId}/approve")]
        public async Task<IActionResult> ApproveCreator(string creatorId)
            => Ok(new { success = await _adminService.ApproveCreatorAsync(creatorId) });

        [HttpPost("creators/{creatorId}/reject")]
        public async Task<IActionResult> RejectCreator(string creatorId)
            => Ok(new { success = await _adminService.RejectCreatorAsync(creatorId) });

        [HttpGet("pending-groups")]
        public async Task<IActionResult> GetPendingGroups()
            => Ok(await _adminService.GetPendingGroupsAsync());

        [HttpPost("groups/{groupId}/approve")]
        public async Task<IActionResult> ApproveGroup(string groupId)
            => Ok(await _adminService.ApproveGroupAsync(groupId));

        [HttpPost("groups/{groupId}/reject")]
        public async Task<IActionResult> RejectGroup(string groupId)
            => Ok(await _adminService.RejectGroupAsync(groupId));
    }
}
