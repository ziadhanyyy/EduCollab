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
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        public NotificationsController(INotificationService notificationService)
            => _notificationService = notificationService;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
            => Ok(await _notificationService.GetUserNotificationsAsync(UserId));

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
            => Ok(new { success = await _notificationService.MarkAllAsReadAsync(UserId) });
    }
}

