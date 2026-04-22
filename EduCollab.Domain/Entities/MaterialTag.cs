using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class MaterialTag
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(50)]
        public Guid StudyMaterialId { get; set; } 
        [ForeignKey(nameof(StudyMaterialId))]
        public StudyMaterial StudyMaterial { get; set; } = null!;
        public string Tag { get; set; } = string.Empty;
    }
}
