using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Infrastructure.Hubs;
using EduCollab.Infrastructure.Hubs.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace EduCollab.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IHubContext<GroupHub, IGroupHubClient> _hub;

        public MessagesController(IMessageService messageService, IHubContext<GroupHub, IGroupHubClient> hub)
        {
            _messageService = messageService;
            _hub = hub;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetGroupMessages(string groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
            => Ok(await _messageService.GetGroupMessagesAsync(groupId, page, pageSize));

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageDto dto)
        {
            var message = await _messageService.SendMessageAsync(UserId, dto);
            // Broadcast to all SignalR clients joined to this group
            await _hub.Clients.Group(dto.GroupId).ReceiveMessage(message);
            return Ok(message);
        }

        [HttpDelete("{messageId}")]
        public async Task<IActionResult> Delete(string messageId)
            => Ok(new { success = await _messageService.DeleteMessageAsync(messageId, UserId) });
    }
}
 
