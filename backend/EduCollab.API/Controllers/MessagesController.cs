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
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        public MessagesController(IMessageService messageService) => _messageService = messageService;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetGroupMessages(string groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
            => Ok(await _messageService.GetGroupMessagesAsync(groupId, page, pageSize));

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageDto dto)
            => Ok(await _messageService.SendMessageAsync(UserId, dto));

        [HttpDelete("{messageId}")]
        public async Task<IActionResult> Delete(string messageId)
            => Ok(new { success = await _messageService.DeleteMessageAsync(messageId, UserId) });
    }
}
 
