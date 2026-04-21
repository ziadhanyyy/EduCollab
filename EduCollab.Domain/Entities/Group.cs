using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class Group
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public int MaxMembers { get; set; } 
        public MeetingType MeetingType { get; set; } = MeetingType.Online;
        public string? OnlineLink { get; set; }
        public string? OfflineAddress { get; set; }
        public DateTime? MeetingSchedule { get; set; }
        public GroupApprovalStatus ApprovalStatus { get; set; } = GroupApprovalStatus.Pending;
        public Guid CreatorId { get; set; }
        public ApplicationUser Creator { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
        public ICollection<JoinRequest> JoinRequests { get; set; } = new List<JoinRequest>();
        public ICollection<StudyMaterial> StudyMaterials { get; set; } = new List<StudyMaterial>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
