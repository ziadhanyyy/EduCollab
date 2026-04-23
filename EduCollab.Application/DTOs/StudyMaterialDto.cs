using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EduCollab.Application.DTOs
{
    public record StudyMaterialDto(
    string Id,
    string GroupId,
    string UploaderId,
    string UploaderName,
    string OriginalFileName,
    string FileUrl,
    string ContentType,
    long FileSizeBytes,
    DateTime UploadedAt,
    IEnumerable<string> Tags
);

    public record AddTagDto(
        string Tag
);
}
