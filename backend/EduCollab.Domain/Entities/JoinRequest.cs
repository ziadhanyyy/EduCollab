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
    public class JoinRequest
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid GroupId { get; set; }
        [ForeignKey(nameof(GroupId))]
        public Group Group { get; set; } = null!;
        [Required]
        public Guid StudentId { get; set; }
        [ForeignKey(nameof(StudentId))]
        public ApplicationUser Student { get; set; } = null!;
        public JoinRequestStatus Status { get; set; } = JoinRequestStatus.Pending;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    }
}
