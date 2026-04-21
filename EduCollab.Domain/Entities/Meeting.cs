using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class Meeting
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public Group Group { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; } = 0;
        public string? MeetingUrl { get; set; }
        public string? OfflineAddress { get; set; }
        public MeetingStatus Status { get; set; } = MeetingStatus.Scheduled;
        public Guid OrganizerId { get; set; }
        public ApplicationUser Organizer { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<MeetingAttendee> Attendees { get; set; } = new List<MeetingAttendee>();
    }
}
