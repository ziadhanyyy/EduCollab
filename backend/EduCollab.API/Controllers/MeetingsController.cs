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
    [Authorize]
    public class MeetingsController : ControllerBase
    {
        private readonly IMeetingService _meetingService;
        public MeetingsController(IMeetingService meetingService) => _meetingService = meetingService;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetGroupMeetings(string groupId)
            => Ok(await _meetingService.GetGroupMeetingsAsync(groupId));

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming()
            => Ok(await _meetingService.GetUpcomingMeetingsAsync());

        [HttpGet("{meetingId}")]
        public async Task<IActionResult> GetById(string meetingId)
            => Ok(await _meetingService.GetMeetingByIdAsync(meetingId));

        [HttpPost]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Create([FromBody] CreateMeetingDto dto)
            => Ok(await _meetingService.CreateMeetingAsync(UserId, dto));

        [HttpPut("{meetingId}")]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Update(string meetingId, [FromBody] UpdateMeetingDto dto)
            => Ok(await _meetingService.UpdateMeetingAsync(meetingId, UserId, dto));

        [HttpDelete("{meetingId}")]
        [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Delete(string meetingId)
            => Ok(new { success = await _meetingService.DeleteMeetingAsync(meetingId, UserId) });
    }
}

