using EduCollab.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(ApplicationUser user,string roles);
    }
}
