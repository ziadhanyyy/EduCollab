using EduCollab.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EduCollab.API.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _materialService;

        public MaterialController(IMaterialService materialService)
        {
            _materialService = materialService;
        }
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMaterial(
            [FromForm] string groupId,
            [FromForm] IFormFile file,
            [FromForm] List<string>? tags)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _materialService.UploadMaterialAsync(
                userId!,
                groupId,
                file,
                tags);

            return Ok(result);
        }

        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetGroupMaterials(string groupId)
        {
            var result = await _materialService.GetGroupMaterialsAsync(groupId);

            return Ok(result);
        }

        [HttpGet("group/{groupId}/search")]
        public async Task<IActionResult> SearchByTag(
            string groupId,
            [FromQuery] string tag)
        {
            var result = await _materialService.SearchMaterialsByTagAsync(
                groupId,
                tag);

            return Ok(result);
        }

        [HttpPost("{materialId}/tags")]
        public async Task<IActionResult> AddTag(
            string materialId,
            [FromBody] string tag)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _materialService.AddTagAsync(
                materialId,
                userId!,
                tag);

            return Ok(result);
        }

        [HttpDelete("tags/{tagId}")]
        public async Task<IActionResult> RemoveTag(string tagId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var result = await _materialService.RemoveTagAsync(
                userId!,
                tagId);

            return Ok(result);
        }
        [HttpDelete("{materialId}")]
        public async Task<IActionResult> DeleteMaterial(string materialId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await _materialService.DeleteMaterialAsync(
                materialId,
                userId!);

            return NoContent();
        }

        [HttpGet("{materialId}/download")]
        public async Task<IActionResult> DownloadMaterial(string materialId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var result = await _materialService.DownloadMaterialAsync(materialId, userId!);

            return File(
                result!.Value.Data,
                result.Value.ContentType,
                result.Value.FileName);
        }
    }
}

