import React from 'react';
import { XCircle } from 'lucide-react';
import { t } from '@/i18n';

interface ProgressBarProps {
  percent: number;
  label?: string;
  onCancel?: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  label,
  onCancel,
}) => {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-live="polite"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {t('global.processing', { percent: clampedPercent })}
        </span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
            aria-label={t('global.cancel')}
          >
            <XCircle className="h-4 w-4" />
            <span>{t('global.cancel')}</span>
          </button>
        )}
      </div>

      <div
        className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300 dark:bg-brand-500"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      {label && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}
    </div>
  );
};
