using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EduCollab.Domain.Enums;

namespace EduCollab.Domain.Entities
{
    public class JoinRequest
    {
        public Guid Id { get; set; }
        public Guid GroupId { get; set; }
        public Group Group { get; set; } = null!;
        public Guid StudentId { get; set; }
        public ApplicationUser Student { get; set; } = null!;
        public JoinRequestStatus Status { get; set; } = JoinRequestStatus.Pending;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}
