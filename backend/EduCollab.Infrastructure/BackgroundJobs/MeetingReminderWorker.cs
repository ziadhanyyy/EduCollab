using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Enums;
using EduCollab.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EduCollab.Infrastructure.BackgroundJobs
{
    public class MeetingReminderWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<MeetingReminderWorker> _logger;
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

        public MeetingReminderWorker(IServiceScopeFactory scopeFactory, ILogger<MeetingReminderWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("MeetingReminderWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessRemindersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while processing meeting reminders.");
                }

                await Task.Delay(Interval, stoppingToken);
            }
        }

        private async Task ProcessRemindersAsync(CancellationToken ct)
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var now = DateTime.UtcNow;
            var windowStart = now.AddMinutes(55);
            var windowEnd = now.AddMinutes(65);

            var meetings = await db.Meetings
                .Where(m =>
                    m.Status == Domain.Enums.MeetingStatus.Scheduled &&
                    !m.ReminderSent &&
                    m.ScheduledAt >= windowStart &&
                    m.ScheduledAt <= windowEnd)
                .Include(m => m.Organizer)
                .ToListAsync(ct);

            if (meetings.Count == 0) return;

            _logger.LogInformation("Sending reminders for {Count} meeting(s).", meetings.Count);

            foreach (var meeting in meetings)
            {
                var dto = new MeetingDto(
                    meeting.Id.ToString(),
                    meeting.GroupId.ToString(),
                    meeting.Title,
                    meeting.Description,
                    meeting.ScheduledAt,
                    meeting.DurationMinutes,
                    meeting.MeetingUrl,
                    meeting.OfflineAddress,
                    meeting.Status,
                    meeting.OrganizerId.ToString(),
                    meeting.Organizer.DisplayName,
                    meeting.CreatedAt);

                await notifService.SendMeetingRemindersAsync(meeting.GroupId.ToString(), dto);

                meeting.ReminderSent = true;
            }

            await db.SaveChangesAsync(ct);
        }
    }
}
