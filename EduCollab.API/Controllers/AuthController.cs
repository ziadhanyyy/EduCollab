using Azure.Identity;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel;
using System.Data;

namespace EduCollab.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IJwtService _jwt;

        public AuthController(UserManager<ApplicationUser> userManager, IJwtService jwt)
        {
            _userManager = userManager;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { error = "Email and password are required." });

            var allowedRoles = new[] { "Student", "GroupCreator" };
            var role = dto.Role ?? "Student";
            if (!allowedRoles.Contains(role))
                return BadRequest(new { error = "Role must be 'Student' or 'GroupCreator'." });

            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null)
                return Conflict(new { error = "Email already registered." });

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                CreatorApprovalStatus = role == "GroupCreator" ? CreatorApprovalStatus.Pending : null
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            await _userManager.AddToRoleAsync(user, role);

            return Ok(new
            {
                message = role == "GroupCreator"
                    ? "Registration successful. Your account is pending admin approval."
                    : "Registration successful.",
                userId = user.Id.ToString()
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { error = "Invalid credentials." });

            var valid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!valid)
                return Unauthorized(new { error = "Invalid credentials." });
            var roles = await _userManager.GetRolesAsync(user);
            string role = "Student";
            if (roles.Contains("Admin")) role = "Admin";
            else if (roles.Contains("GroupCreator")) role = "GroupCreator";
            else if (roles.Count > 0) role = roles.First();

            if (role == "GroupCreator" && user.CreatorApprovalStatus != CreatorApprovalStatus.Approved)
                return Unauthorized(new { error = "Your account is pending admin approval." });

            var token = _jwt.GenerateToken(user, role);

            return Ok(new { token, userId = user.Id.ToString(), displayName = user.DisplayName, email = user.Email, role });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null) return NotFound();
            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new { user = new UserDto(user.Id.ToString(), user.UserName!, user.Email!, user.DisplayName, user.CreatedAt), roles });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
            => Ok(new { message = "Logged out. Please discard your token on the client side." });
    }
}

