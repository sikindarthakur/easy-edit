import React from 'react';
import { FileText, Image as ImageIcon, Archive, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { formatBytes } from '@/lib/formatters';

interface FileCardProps {
  file: File;
  index: number;
  totalFiles: number;
  thumbnailUrl?: string;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  index,
  totalFiles,
  thumbnailUrl,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const isZip = file.type.includes('zip') || file.name.endsWith('.zip');

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        {/* Preview Thumbnail or Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={file.name} className="h-full w-full object-cover" />
          ) : isImage ? (
            <ImageIcon className="h-6 w-6 text-blue-500" />
          ) : isPdf ? (
            <FileText className="h-6 w-6 text-rose-500" />
          ) : isZip ? (
            <Archive className="h-6 w-6 text-purple-500" />
          ) : (
            <FileText className="h-6 w-6 text-slate-500" />
          )}
        </div>

        {/* File metadata */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {file.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(file.size)}
          </p>
        </div>
      </div>

      {/* Controls: Reorder & Remove */}
      <div className="flex items-center gap-1">
        {totalFiles > 1 && onMoveUp && onMoveDown && (
          <div className="flex items-center">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={`Move ${file.name} up`}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={index === totalFiles - 1}
              onClick={() => onMoveDown(index)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={`Move ${file.name} down`}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          aria-label={`Remove ${file.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
