using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
        public class Message
        {
            public Guid Id { get; set; }
            public Guid GroupId { get; set; }
            public Group Group { get; set; } = null!;
            public Guid SenderId { get; set; }
            public ApplicationUser Sender { get; set; } = null!;
            public string Content { get; set; } = string.Empty;
            public DateTime SentAt { get; set; } = DateTime.UtcNow;
            public bool IsDeleted { get; set; } = false;
        }
    }

