using EduCollab.Application.DTOs;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.Interfaces
{
   public interface IMaterialService
    {
        Task<StudyMaterialDto> UploadMaterialAsync(string uploaderId, string groupId,IFormFile file, IEnumerable<string>? tags);
        Task<IEnumerable<StudyMaterialDto>> GetGroupMaterialsAsync(string groupId);
        Task<IEnumerable<StudyMaterialDto>> SearchMaterialsByTagAsync(string groupId, string tag);
        Task<StudyMaterialDto?> AddTagAsync(string materialId, string userId, string tag);
        Task<bool> DeleteMaterialAsync(string materialId, string userId);
        Task<(byte[] Data, string ContentType, string FileName)?> DownloadMaterialAsync(string materialId);
        Task<StudyMaterialDto> RemoveTagAsync(string userId, string tagId);
    }
}
