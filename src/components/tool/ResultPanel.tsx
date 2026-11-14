import React from 'react';
import { Download, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ToolResult } from '@/tools/types';
import { formatBytes, calculateSavings } from '@/lib/formatters';
import { t } from '@/i18n';

interface ResultPanelProps {
  result: ToolResult;
  onDownload: () => void;
  onStartOver: () => void;
  onUseInAnotherTool?: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  onDownload,
  onStartOver,
  onUseInAnotherTool,
}) => {
  const fileCount = result.files.length;
  const stats = result.stats;

  const savings = stats ? calculateSavings(stats.inputBytes, stats.outputBytes) : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {t('global.successTitle')}
          </h2>
          {stats && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              {savings && savings.smaller
                ? t('global.successDetail', {
                    oldSize: formatBytes(stats.inputBytes),
                    newSize: formatBytes(stats.outputBytes),
                    percent: savings.percent,
                  })
                : `${formatBytes(stats.inputBytes)} → ${formatBytes(stats.outputBytes)}`}
            </p>
          )}
        </div>
      </div>

      {/* File list preview */}
      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/50">
        {result.files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 text-sm">
            <span className="truncate font-medium text-slate-800 dark:text-slate-200">
              {file.name}
            </span>
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {formatBytes(file.blob.size)}
            </span>
          </div>
        ))}
      </div>

      {/* Result image preview if available */}
      {result.files[0]?.previewUrl && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
          <img
            src={result.files[0].previewUrl}
            alt="Result preview"
            className="max-h-80 w-full object-contain"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 font-semibold text-white shadow-md transition hover:bg-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500"
        >
          <Download className="h-5 w-5" />
          <span>
            {fileCount > 1
              ? `${t('global.download')} ZIP (${fileCount} files)`
              : t('global.download')}
          </span>
        </button>

        <button
          type="button"
          onClick={onStartOver}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t('global.startOver')}</span>
        </button>

        {onUseInAnotherTool && (
          <button
            type="button"
            onClick={onUseInAnotherTool}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span>{t('global.useInAnotherTool')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
