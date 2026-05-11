using EduCollab.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class ApplicationUser: IdentityUser<Guid>
    {
        public string DisplayName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public CreatorApprovalStatus? CreatorApprovalStatus { get; set; }
        public ICollection<GroupMember> GroupMemberships { get; set; } = new List<GroupMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<MeetingAttendee> MeetingAttendees { get; set; } = new List<MeetingAttendee>();
        public ICollection<JoinRequest> JoinRequests { get; set; } = new List<JoinRequest>();
        public ICollection<StudyMaterial> StudyMaterials { get; set; } = new List<StudyMaterial>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
       
    }
}
