import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ToolDefinition, ToolResult } from '@/tools/types';
import { UploadZone } from './UploadZone';
import { FileCard } from './FileCard';
import { OptionsPanel } from './OptionsPanel';
import { ProgressBar } from './ProgressBar';
import { ResultPanel } from './ResultPanel';
import { ErrorAlert } from './ErrorAlert';
import { validateFiles } from '@/lib/fileValidation';
import { downloadResults, getEasyEditFilename } from '@/lib/download';
import { runToolProcessor } from '@/workers/runner';
import { getToolById } from '@/tools/registry';
import { t } from '@/i18n';

interface ToolPageShellProps {
  tool: ToolDefinition;
  customPreview?: React.ReactNode;
  onFilesChanged?: (files: File[]) => void;
}

type ToolState = 'empty' | 'files_added' | 'processing' | 'done' | 'error';

export const ToolPageShell: React.FC<ToolPageShellProps> = ({
  tool,
  customPreview,
  onFilesChanged,
}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {};
    for (const opt of tool.options) {
      defaults[opt.id] = opt.defaultValue;
    }
    return defaults;
  });

  const [toolState, setToolState] = useState<ToolState>('empty');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync files with callback if provided
  useEffect(() => {
    if (onFilesChanged) {
      onFilesChanged(files);
    }
  }, [files, onFilesChanged]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (result) {
        for (const file of result.files) {
          if (file.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
          }
        }
      }
    };
  }, [result]);

  const handleFilesSelected = async (newFiles: File[]) => {
    setErrorMessage(null);

    const mergedFiles = tool.multiple ? [...files, ...newFiles] : newFiles.slice(0, 1);

    // Validate files by magic bytes, size limits, format
    const validation = await validateFiles(
      mergedFiles,
      tool.acceptedFormats,
      tool.limits,
      tool.multiple
    );

    if (!validation.valid && validation.error) {
      setErrorMessage(validation.error);
      return;
    }

    setFiles(mergedFiles);
    setToolState('files_added');
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    setFiles(nextFiles);
    if (nextFiles.length === 0) {
      setToolState('empty');
      setResult(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...files];
    const temp = next[index - 1];
    const curr = next[index];
    if (temp && curr) {
      next[index - 1] = curr;
      next[index] = temp;
      setFiles(next);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index >= files.length - 1) return;
    const next = [...files];
    const temp = next[index + 1];
    const curr = next[index];
    if (temp && curr) {
      next[index + 1] = curr;
      next[index] = temp;
      setFiles(next);
    }
  };

  const handleOptionChange = (id: string, value: unknown) => {
    setOptions((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleRun = async () => {
    if (files.length === 0) return;

    setToolState('processing');
    setProgressPercent(5);
    setProgressLabel(t('global.processing', { percent: 5 }));
    setErrorMessage(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await runToolProcessor({
        tool,
        files,
        options,
        signal: controller.signal,
        onProgress: (percent, label) => {
          setProgressPercent(percent);
          if (label) setProgressLabel(label);
        },
      });

      setResult(res);
      setToolState('done');
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        setToolState(files.length > 0 ? 'files_added' : 'empty');
        setErrorMessage(t('errors.cancelled'));
      } else {
        setToolState('error');
        const msg = err instanceof Error ? err.message : t('errors.processingFailed');
        setErrorMessage(msg);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleStartOver = () => {
    setFiles([]);
    setResult(null);
    setToolState('empty');
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!result || result.files.length === 0) return;

    const firstOriginalName = files[0]?.name || 'document';
    const defaultZipName = `${getEasyEditFilename(firstOriginalName)}.zip`;

    downloadResults(result.files, defaultZipName);
  };

  const relatedTools = useMemo(() => {
    return tool.related
      .map((id) => getToolById(id))
      .filter((t): t is ToolDefinition => !!t && t.enabled);
  }, [tool.related]);

  // Structured Data (JSON-LD) for SEO
  const structuredData = useMemo(() => {
    const schema: Record<string, unknown>[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        operatingSystem: 'Any',
        applicationCategory: 'UtilityApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: tool.description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://easyedit.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: tool.category.toUpperCase(),
            item: `https://easyedit.app/${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.name,
            item: `https://easyedit.app${tool.route}`,
          },
        ],
      },
    ];

    if (tool.faq && tool.faq.length > 0) {
      schema.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: tool.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      });
    }

    return JSON.stringify(schema);
  }, [tool]);

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <li>
            <Link to="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              to={`/${tool.category}`}
              className="uppercase hover:text-slate-900 dark:hover:text-white"
            >
              {tool.category}
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
            {tool.name}
          </li>
        </ol>
      </nav>

      {/* Tool Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Lock className="h-3.5 w-3.5" />
          <span>{t('global.privacyBadge')}</span>
        </div>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
          {tool.title}
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          {tool.description}
        </p>
      </header>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6">
          <ErrorAlert
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={files.length > 0 ? handleRun : undefined}
          />
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column: Upload zone, files list, custom preview, progress, result */}
        <div className={tool.isTextTool ? 'space-y-6 lg:col-span-12' : 'space-y-6 lg:col-span-8'}>
          {tool.isTextTool && customPreview ? (
            customPreview
          ) : (
            <>
              {toolState === 'empty' && (
                <UploadZone
                  acceptedFormats={tool.acceptedFormats}
                  multiple={tool.multiple}
                  onFilesSelected={handleFilesSelected}
                />
              )}

              {toolState === 'processing' && (
                <ProgressBar
                  percent={progressPercent}
                  label={progressLabel}
                  onCancel={handleCancel}
                />
              )}

              {toolState === 'done' && result && (
                <ResultPanel
                  result={result}
                  onDownload={handleDownload}
                  onStartOver={handleStartOver}
                  onUseInAnotherTool={() => navigate('/tools')}
                />
              )}

              {/* Files List when added or during configuration */}
              {files.length > 0 && toolState !== 'processing' && toolState !== 'done' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Selected Files ({files.length})
                    </h3>
                    {tool.multiple && (
                      <UploadZone
                        compact
                        acceptedFormats={tool.acceptedFormats}
                        multiple={tool.multiple}
                        onFilesSelected={handleFilesSelected}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <FileCard
                        key={`${file.name}-${idx}`}
                        file={file}
                        index={idx}
                        totalFiles={files.length}
                        onRemove={handleRemoveFile}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                      />
                    ))}
                  </div>

                  {customPreview}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column: Sticky Options & Action Panel (for non-text tools) */}
        {!tool.isTextTool && (
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <OptionsPanel
                options={tool.options}
                values={options}
                onChange={handleOptionChange}
                primaryActionLabel={tool.primaryActionLabel}
                onRun={handleRun}
                isProcessing={toolState === 'processing'}
                canRun={files.length > 0 && toolState !== 'processing'}
              />
            </div>
          </div>
        )}
      </div>

      {/* How it works steps */}
      {tool.steps && tool.steps.length > 0 && (
        <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            How to {tool.name}
          </h2>
          <ol className="mt-6 space-y-4">
            {tool.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  {idx + 1}
                </span>
                <span className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {tool.faq && tool.faq.length > 0 && (
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
            {tool.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Related Tools
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools.map((rel) => (
              <Link
                key={rel.id}
                to={rel.route}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {rel.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {rel.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
