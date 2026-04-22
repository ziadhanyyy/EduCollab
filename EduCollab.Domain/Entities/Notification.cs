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
    public class Notification
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; } = null!;
        public Guid? GroupId { get; set; }
        [ForeignKey(nameof(GroupId))]
        public Group? Group { get; set; }
        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
         public bool IsRead { get; set; }=false;
    }
}
