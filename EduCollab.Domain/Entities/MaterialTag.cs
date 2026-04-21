using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Domain.Entities
{
    public class MaterialTag
    {
        public Guid Id { get; set; }
        public Guid StudyMaterialId { get; set; }
        public StudyMaterial StudyMaterial { get; set; } = null!;
        public string Tag { get; set; } = string.Empty;
    }
}
