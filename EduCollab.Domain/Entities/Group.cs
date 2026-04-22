using EduCollab.Domain.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class Group
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        public int MaxMembers { get; set; } 
        public MeetingType MeetingType { get; set; } = MeetingType.Online;
        public string? OnlineLink { get; set; }
        public string? OfflineAddress { get; set; }
        public DateTime? MeetingSchedule { get; set; }
        public GroupApprovalStatus ApprovalStatus { get; set; } = GroupApprovalStatus.Pending;
        
        public Guid CreatorId { get; set; }
        [ForeignKey(nameof(CreatorId))]
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
