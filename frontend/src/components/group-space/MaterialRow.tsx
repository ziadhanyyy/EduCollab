import { Download, FileText, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import api from '@/lib/api';
import type { StudyMaterial } from '@/types';
import { extractErrorMessage, formatBytes } from '@/utils/helpers';

interface Props {
  material: StudyMaterial;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
}

export default function MaterialRow({ material, canDelete, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(material.id);
      toast.success('File deleted.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Delete failed.'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const response = await api.get(`/material/${material.id}/download`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.originalFileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Download failed.'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b last:border-0">
      <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{material.originalFileName}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatBytes(material.fileSizeBytes)} · {material.uploaderName}
        </p>
        {material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {material.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 mt-0.5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="text-muted-foreground hover:text-primary transition-colors"
          aria-label="Download file"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={deleting}
                className="text-destructive/70 hover:text-destructive transition-colors"
                aria-label="Delete file"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <Trash2 />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete file?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium text-foreground">{material.originalFileName}</span>{' '}
                  will be permanently deleted and cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
