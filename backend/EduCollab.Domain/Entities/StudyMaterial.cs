using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class StudyMaterial
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public Guid GroupId { get; set; }
        [ForeignKey(nameof(GroupId))]
        public Group Group { get; set; } = null!;
        [Required]
        public Guid UploaderId { get; set; }
        [ForeignKey(nameof(UploaderId))]
        public ApplicationUser Uploader { get; set; } = null!;
        [Required]
        public string FileName { get; set; } = string.Empty;
        [Required]
        public string OriginalFileName { get; set; } = string.Empty;
        [Required]
        public string FileUrl { get; set; } = string.Empty;
        [Required]
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public ICollection<MaterialTag> Tags { get; set; } = new List<MaterialTag>();
    }
}
