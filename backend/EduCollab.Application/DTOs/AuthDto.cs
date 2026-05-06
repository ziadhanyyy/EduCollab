using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record RegisterDto(
    string UserName,
    string Email,
    string Password,
    string DisplayName,
    string Role = "Student"
    );

    public record LoginDto(
        string Email,
        string Password
    );

    public record UserDto(
        string Id,
        string UserName,
        string Email,
        string DisplayName,
        DateTime CreatedAt
    );

    public record PendingCreatorDto(
        string Id,
        string UserName,
        string Email,
        string DisplayName,
        DateTime CreatedAt
    );
}
