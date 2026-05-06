using EduCollab.Application.Common.Exceptions;
using EduCollab.Application.DTOs;
using EduCollab.Application.Interfaces;
using EduCollab.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
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

        public Task<StudyMaterialDto?> AddTagAsync(string materialId, string userId, string tag)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteMaterialAsync(string materialId, string userId)
        {
            throw new NotImplementedException();
        }

        public Task<(byte[] Data, string ContentType, string FileName)?> DownloadMaterialAsync(string materialId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<StudyMaterialDto>> GetGroupMaterialsAsync(string groupId)
        {
            throw new NotImplementedException();
        }

        public Task<StudyMaterialDto> RemoveTagAsync(string userId, string tagId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<StudyMaterialDto>> SearchMaterialsByTagAsync(string groupId, string tag)
        {
            throw new NotImplementedException();
        }

        public Task<StudyMaterialDto> UploadMaterialAsync(string uploaderId, string groupId, IFormFile file, IEnumerable<string>? tags)
        {
            throw new NotImplementedException();
        }
        
        }
    }

