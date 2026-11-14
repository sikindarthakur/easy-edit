import React from 'react';
import { OptionField } from '@/tools/types';

interface OptionsPanelProps {
  options: OptionField[];
  values: Record<string, unknown>;
  onChange: (id: string, value: unknown) => void;
  primaryActionLabel: string;
  onRun: () => void;
  isProcessing: boolean;
  canRun: boolean;
  className?: string;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  options,
  values,
  onChange,
  primaryActionLabel,
  onRun,
  isProcessing,
  canRun,
  className = '',
}) => {
  const isFieldVisible = (field: OptionField): boolean => {
    if (!field.dependsOn) return true;
    const currentVal = values[field.dependsOn.field];
    return currentVal === field.dependsOn.value;
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
          Options
        </h2>

        {options.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            No configuration needed. Click the button below to start.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {options.map((field) => {
              if (!isFieldVisible(field)) return null;

              const val = values[field.id] !== undefined ? values[field.id] : field.defaultValue;

              return (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={field.id}
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    {field.label}
                  </label>

                  {/* Select */}
                  {field.type === 'select' && (
                    <select
                      id={field.id}
                      value={String(val)}
                      disabled={isProcessing}
                      onChange={(e) => {
                        const parsedVal =
                          typeof field.defaultValue === 'number'
                            ? Number(e.target.value)
                            : e.target.value;
                        onChange(field.id, parsedVal);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Radio */}
                  {field.type === 'radio' && (
                    <div className="space-y-2 pt-1">
                      {field.options?.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                          <input
                            type="radio"
                            name={field.id}
                            value={String(opt.value)}
                            checked={val === opt.value}
                            disabled={isProcessing}
                            onChange={() => onChange(field.id, opt.value)}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 dark:bg-slate-800"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Number */}
                  {field.type === 'number' && (
                    <input
                      id={field.id}
                      type="number"
                      value={typeof val === 'number' ? val : 0}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      placeholder={field.placeholder}
                      disabled={isProcessing}
                      onChange={(e) => onChange(field.id, Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  )}

                  {/* Text */}
                  {field.type === 'text' && (
                    <input
                      id={field.id}
                      type="text"
                      value={String(val || '')}
                      placeholder={field.placeholder}
                      disabled={isProcessing}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  )}

                  {/* Checkbox */}
                  {field.type === 'checkbox' && (
                    <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        id={field.id}
                        type="checkbox"
                        checked={Boolean(val)}
                        disabled={isProcessing}
                        onChange={(e) => onChange(field.id, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span>{field.label}</span>
                    </label>
                  )}

                  {/* Range */}
                  {field.type === 'range' && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{field.min}</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {String(val)}{field.unit || ''}
                        </span>
                        <span>{field.max}</span>
                      </div>
                      <input
                        id={field.id}
                        type="range"
                        value={Number(val)}
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                        disabled={isProcessing}
                        onChange={(e) => onChange(field.id, Number(e.target.value))}
                        className="h-2 w-full cursor-pointer accent-brand-600"
                      />
                    </div>
                  )}

                  {field.helpText && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {field.helpText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {primaryActionLabel && (
        <div className="mt-8 pt-4">
          <button
            type="button"
            disabled={!canRun || isProcessing}
            onClick={onRun}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand-600 px-6 font-semibold text-white shadow-md transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            {primaryActionLabel}
          </button>
        </div>
      )}
    </div>
  );
};
