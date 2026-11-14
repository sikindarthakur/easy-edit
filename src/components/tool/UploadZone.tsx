import React, { useRef, useState, useEffect, useCallback } from 'react';
import { UploadCloud, Plus } from 'lucide-react';
import { t } from '@/i18n';

interface UploadZoneProps {
  acceptedFormats: string[];
  multiple: boolean;
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  acceptedFormats,
  multiple,
  onFilesSelected,
  compact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptString = acceptedFormats.includes('*') ? undefined : acceptedFormats.join(',');

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const filesArray = Array.from(fileList);
      onFilesSelected(filesArray);
    },
    [onFilesSelected]
  );

  // Listen for paste events (e.g. pasted screenshots/images)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === 'file') {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }

      if (pastedFiles.length > 0) {
        onFilesSelected(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  if (compact) {
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Upload files"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-400 dark:hover:text-brand-400"
        >
          <Plus className="h-4 w-4" />
          <span>Add more files</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
      className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-default sm:p-12 ${
        isDragOver
          ? 'border-brand-600 bg-brand-50/80 dark:border-brand-400 dark:bg-brand-950/30'
          : 'border-slate-300 bg-white hover:border-brand-500 hover:bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-400 dark:hover:bg-slate-850'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleButtonClick();
        }
      }}
      aria-label={t('global.uploadZoneDesktop')}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptString}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
      />

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-transform duration-default group-hover:scale-105 dark:bg-brand-950/50 dark:text-brand-400">
        <UploadCloud className="h-8 w-8" aria-hidden="true" />
      </div>

      <div className="mt-4">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
          {isDragOver ? (
            <span className="text-brand-600 dark:text-brand-400">{t('global.dragOver')}</span>
          ) : (
            <>
              <span className="hidden sm:inline">{t('global.uploadZoneDesktop')}</span>
              <span className="inline sm:hidden">{t('global.uploadZoneMobile')}</span>
            </>
          )}
        </p>

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {multiple ? 'Select single or multiple files · ' : 'Select single file · '}
          Files never leave your device
        </p>
      </div>

      <button
        type="button"
        tabIndex={-1}
        className="mt-6 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500"
      >
        {t('global.uploadZoneMobile')}
      </button>
    </div>
  );
};
