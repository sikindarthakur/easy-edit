import React, { useState } from 'react';
import { Copy, Check, Download, Trash2, Upload } from 'lucide-react';
import { ToolDefinition } from '@/tools/types';
import { downloadBlob } from '@/lib/download';
import { t } from '@/i18n';

interface TextToolShellProps {
  tool: ToolDefinition;
  initialText?: string;
  placeholder?: string;
  actionButtons?: {
    label: string;
    onClick: (currentText: string) => string | void | Promise<string | void>;
    primary?: boolean;
  }[];
  statsRenderer?: (text: string) => React.ReactNode;
  customControls?: React.ReactNode;
  outputTransform?: (text: string) => { text: string; error?: string };
}

export const TextToolShell: React.FC<TextToolShellProps> = ({
  tool,
  initialText = '',
  placeholder = 'Type or paste your text here…',
  actionButtons = [],
  statsRenderer,
  customControls,
  outputTransform,
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformed = outputTransform ? outputTransform(inputText) : { text: inputText };
  const currentOutput = transformed.text;
  const currentError = transformed.error || error;

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setInputText(content);
        setError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const ext = tool.id.includes('json') ? 'json' : tool.id.includes('markdown') ? 'md' : 'txt';
    const blob = new Blob([currentOutput], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${tool.id}-easyedit.${ext}`);
  };

  return (
    <div className="space-y-6">
      {/* Live Textarea Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload file</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>

            <button
              type="button"
              onClick={() => {
                setInputText('');
                setError(null);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(currentOutput)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('global.copiedToast')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Custom Controls (e.g. JSON options, Case conversion buttons) */}
        {customControls && <div className="py-3">{customControls}</div>}

        {/* Action Buttons */}
        {actionButtons.length > 0 && (
          <div className="flex flex-wrap gap-2 py-3">
            {actionButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={async () => {
                  const updated = await btn.onClick(inputText);
                  if (typeof updated === 'string') {
                    setInputText(updated);
                  }
                }}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  btn.primary
                    ? 'bg-brand-600 text-white hover:bg-brand-500'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Text input area */}
        <div className="mt-2">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            rows={10}
            className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-brand-400 dark:focus:bg-slate-900"
          />
        </div>

        {/* Error message if invalid syntax (e.g. JSON validation error) */}
        {currentError && (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {currentError}
          </div>
        )}

        {/* Live stats footer */}
        {statsRenderer && <div className="mt-4 pt-3">{statsRenderer(inputText)}</div>}
      </div>
    </div>
  );
};
