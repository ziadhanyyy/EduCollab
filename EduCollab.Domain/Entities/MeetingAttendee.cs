using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class MeetingAttendee
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid MeetingId { get; set; }
        [ForeignKey(nameof(MeetingId))]
        public Meeting Meeting { get; set; } = null!;
        [Required]
        public Guid UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; } = null!;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

}
