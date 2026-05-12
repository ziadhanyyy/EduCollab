import { FileText, Loader2, Search, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudyMaterial } from '@/types';
import { extractErrorMessage } from '@/utils/helpers';
import MaterialRow from './MaterialRow';

interface Props {
  groupId: string;
  materials: StudyMaterial[];
  loading: boolean;
  upload: (groupId: string, file: File, tags: string[]) => Promise<StudyMaterial>;
  removeMaterial: (id: string) => Promise<void>;
  searchByTag: (tag: string) => Promise<void>;
  userId: string | undefined;
}

export default function MaterialsTab({
  groupId,
  materials,
  loading,
  upload,
  removeMaterial,
  searchByTag,
  userId,
}: Props) {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const tags = uploadTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await upload(groupId, uploadFile, tags);
      toast.success('Material uploaded!');
      setShowUpload(false);
      setUploadFile(null);
      setUploadTags('');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  }

  async function handleTagSearch(value: string) {
    setTagSearch(value);
    await searchByTag(value);
  }

  async function clearTagSearch() {
    setTagSearch('');
    await searchByTag('');
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="px-3 pt-3 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-1.5"
          onClick={() => setShowUpload((v) => !v)}
        >
          <Upload className="h-3.5 w-3.5" />
          {showUpload ? 'Cancel Upload' : 'Upload File'}
        </Button>
      </div>

      {showUpload && (
        <div className="mx-3 mt-3 rounded-lg border bg-muted/30 p-3 space-y-3 shrink-0">
          <div className="space-y-1.5">
            <Label className="text-xs">File</Label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 border-2 border-dashed rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex flex-col items-center justify-center gap-1"
            >
              <FileText className="h-4 w-4" />
              {uploadFile ? uploadFile.name : 'Click to select file'}
            </button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tags (comma-separated)</Label>
            <Input
              className="h-8 text-xs"
              placeholder="e.g. lecture, week3"
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={!uploadFile || uploading}
            onClick={handleUpload}
          >
            {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Upload
          </Button>
        </div>
      )}

      <Separator className="mt-3" />

      <div className="px-3 pt-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-7 text-xs pl-8 pr-7"
            placeholder="Filter by tag…"
            value={tagSearch}
            onChange={(e) => handleTagSearch(e.target.value)}
          />
          {tagSearch && (
            <button
              type="button"
              onClick={clearTagSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="space-y-3 pt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground space-y-1">
            <FileText className="h-6 w-6 mx-auto opacity-30" />
            <p>No materials yet</p>
          </div>
        ) : (
          materials.map((m) => (
            <MaterialRow
              key={m.id}
              material={m}
              canDelete={userId === m.uploaderId}
              onDelete={removeMaterial}
            />
          ))
        )}
      </div>
    </div>
  );
}
