using EduCollab.Application.Common.Exceptions;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Domain.Entities;
using EduCollab.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace EduCollab.Infrastructure.Services
{
    public class MaterialService : IMaterialService
    {

        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public MaterialService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<StudyMaterialDto> UploadMaterialAsync(
             string uploaderId, string groupId, IFormFile file, IEnumerable<string>? tags)
        {
            if (!Guid.TryParse(uploaderId, out var uid))
                throw new BadRequestException("Invalid uploader id.");
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid group id.");
            if (file == null || file.Length == 0)
                throw new BadRequestException("File is required.");

            var group = await _context.Groups.FindAsync(gid)
                        ?? throw new NotFoundException("Group not found.");

            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == gid && gm.UserId == uid);
            if (!isMember)
                throw new ForbiddenException("You are not a member of this group.");

            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", gid.ToString());
            Directory.CreateDirectory(uploadsRoot);

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(uploadsRoot, uniqueFileName);

            await using (var stream = new FileStream(fullPath, FileMode.Create))
                await file.CopyToAsync(stream);

            var relativeUrl = $"/uploads/{gid}/{uniqueFileName}";

            var material = new StudyMaterial
            {
                GroupId = gid,
                UploaderId = uid,
                FileName = uniqueFileName,
                OriginalFileName = file.FileName,
                FileUrl = relativeUrl,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length
            };

            await _context.StudyMaterials.AddAsync(material);

            if (tags != null)
            {
                foreach (var tag in tags.Where(t => !string.IsNullOrWhiteSpace(t)).Distinct())
                {
                    await _context.MaterialTags.AddAsync(new MaterialTag
                    {
                        StudyMaterialId = material.Id,
                        Tag = tag.Trim().ToLowerInvariant()
                    });
                }
            }

            await _context.SaveChangesAsync();

            return await BuildDtoAsync(material.Id);
        }
        public async Task<IEnumerable<StudyMaterialDto>> GetGroupMaterialsAsync(string groupId)
        {
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid group id.");

            var exists = await _context.Groups.AnyAsync(g => g.Id == gid);
            if (!exists) throw new NotFoundException("Group not found.");

            var materials = await _context.StudyMaterials
                .Include(sm => sm.Uploader)
                .Include(sm => sm.Tags)
                .Where(sm => sm.GroupId == gid)
                .OrderByDescending(sm => sm.UploadedAt)
                .ToListAsync();

            return materials.Select(MapToDto);
        }
        public async Task<IEnumerable<StudyMaterialDto>> SearchMaterialsByTagAsync(string groupId, string tag)
        {
            if (!Guid.TryParse(groupId, out var gid))
                throw new BadRequestException("Invalid group id.");
            if (string.IsNullOrWhiteSpace(tag))
                throw new BadRequestException("Tag is required.");

            var normalised = tag.Trim().ToLowerInvariant();

            var materials = await _context.StudyMaterials
                .Include(sm => sm.Uploader)
                .Include(sm => sm.Tags)
                .Where(sm => sm.GroupId == gid && sm.Tags.Any(t => t.Tag == normalised))
                .OrderByDescending(sm => sm.UploadedAt)
                .ToListAsync();

            return materials.Select(MapToDto);
        }
        public async Task<StudyMaterialDto?> AddTagAsync(string materialId, string userId, string tag)
        {
            if (!Guid.TryParse(materialId, out var mid))
                throw new BadRequestException("Invalid material id.");
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");
            if (string.IsNullOrWhiteSpace(tag))
                throw new BadRequestException("Tag is required.");

            var material = await _context.StudyMaterials
                .Include(sm => sm.Tags)
                .FirstOrDefaultAsync(sm => sm.Id == mid)
                ?? throw new NotFoundException("Material not found.");

            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == material.GroupId && gm.UserId == uid);
            if (!isMember)
                throw new ForbiddenException("You are not a member of this group.");

            var normalised = tag.Trim().ToLowerInvariant();
            if (material.Tags.Any(t => t.Tag == normalised))
                throw new ConflictException("Tag already exists on this material.");

            await _context.MaterialTags.AddAsync(new MaterialTag
            {
                StudyMaterialId = mid,
                Tag = normalised
            });
            await _context.SaveChangesAsync();

            return await BuildDtoAsync(mid);
        }
        public async Task<StudyMaterialDto> RemoveTagAsync(string userId, string tagId)
        {
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");
            if (!Guid.TryParse(tagId, out var tid))
                throw new BadRequestException("Invalid tag id.");

            var materialTag = await _context.MaterialTags
                .Include(mt => mt.StudyMaterial)
                .FirstOrDefaultAsync(mt => mt.Id == tid)
                ?? throw new NotFoundException("Tag not found.");

            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == materialTag.StudyMaterial.GroupId && gm.UserId == uid);
            if (!isMember)
                throw new ForbiddenException("You are not a member of this group.");

            var materialId = materialTag.StudyMaterialId;
            _context.MaterialTags.Remove(materialTag);
            await _context.SaveChangesAsync();

            return await BuildDtoAsync(materialId);
        }
        public async Task<bool> DeleteMaterialAsync(string materialId, string userId)
        {
            if (!Guid.TryParse(materialId, out var mid))
                throw new BadRequestException("Invalid material id.");
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");

            var material = await _context.StudyMaterials.FindAsync(mid)
                           ?? throw new NotFoundException("Material not found.");

            if (material.UploaderId != uid)
                throw new ForbiddenException("Only the uploader can delete this material.");

            var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var fullPath = Path.Combine(wwwroot, material.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(fullPath))
                File.Delete(fullPath);

            _context.StudyMaterials.Remove(material);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(byte[] Data, string ContentType, string FileName)?> DownloadMaterialAsync(string materialId,string userId)
        {
            if (!Guid.TryParse(materialId, out var mid))
                throw new BadRequestException("Invalid material id.");
            if (!Guid.TryParse(userId, out var uid))
                throw new BadRequestException("Invalid user id.");

            var material = await _context.StudyMaterials.FindAsync(mid)
                           ?? throw new NotFoundException("Material not found.");
            var isMember = await _context.GroupMembers
        .AnyAsync(gm => gm.GroupId == material.GroupId && gm.UserId == uid);

            if (!isMember)
                throw new ForbiddenException("You are not a member of this group.");


            var wwwroot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var fullPath = Path.Combine(wwwroot, material.FileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

            if (!File.Exists(fullPath))
                throw new NotFoundException("File not found on server.");

            var bytes = await File.ReadAllBytesAsync(fullPath);
            return (bytes, material.ContentType, material.OriginalFileName);
        }
        private async Task<StudyMaterialDto> BuildDtoAsync(Guid materialId)
        {
            var sm = await _context.StudyMaterials
                .Include(s => s.Uploader)
                .Include(s => s.Tags)
                .FirstAsync(s => s.Id == materialId);
            return MapToDto(sm);
        }

        private static StudyMaterialDto MapToDto(StudyMaterial sm) => new StudyMaterialDto(
            sm.Id.ToString(),
            sm.GroupId.ToString(),
            sm.UploaderId.ToString(),
            sm.Uploader?.DisplayName ?? string.Empty,
            sm.OriginalFileName,
            sm.FileUrl,
            sm.ContentType,
            sm.FileSizeBytes,
            sm.UploadedAt,
            sm.Tags.Select(t => t.Tag)
        );
    }
}
    

