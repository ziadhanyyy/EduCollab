using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
        public class Message
        {
        [Key]
        public Guid Id { get; set; }
        [Required]
            public Guid GroupId { get; set; }
        [ForeignKey(nameof(GroupId))]
            public Group Group { get; set; } = null!;
        [Required]
        public Guid SenderId { get; set; }
        [ForeignKey(nameof(SenderId))]
        public ApplicationUser Sender { get; set; } = null!;
        [Required]
        public string Content { get; set; } = string.Empty;
            public DateTime SentAt { get; set; } = DateTime.UtcNow;
            public bool IsDeleted { get; set; } = false;
        }
    }

