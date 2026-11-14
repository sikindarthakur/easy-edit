import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getToolByRoute } from '@/tools/registry';
import { ToolPageShell } from '@/components/tool/ToolPageShell';
import { TextToolShell } from '@/components/tool/TextToolShell';
import { calculateWordStats } from '@/tools/document/wordCounter';
import { convertCase } from '@/tools/document/caseConverter';
import { formatJson } from '@/tools/developer/jsonFormatter';
import { encodeBase64Text, decodeBase64Text } from '@/tools/developer/base64';
import { renderMarkdownSafe, markdownToPdfProcessor } from '@/tools/document/markdownToPdf';
import { downloadBlob } from '@/lib/download';

export const ToolPage: React.FC = () => {
  const { category, toolSlug } = useParams<{ category: string; toolSlug: string }>();
  const route = `/${category}/${toolSlug}`;
  const tool = getToolByRoute(route);

  // JSON formatter options state for TextToolShell
  const [jsonIndent, setJsonIndent] = useState('2');
  const [jsonSortKeys, setJsonSortKeys] = useState(false);

  // Base64 options state for TextToolShell
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [base64UrlSafe, setBase64UrlSafe] = useState(false);

  // Markdown options state for TextToolShell
  const [mdTheme, setMdTheme] = useState('clean');
  const [mdPageSize, setMdPageSize] = useState('a4');
  const [isCompilingMd, setIsCompilingMd] = useState(false);

  if (!tool) {
    return (
      <div className="mx-auto max-w-content px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <p className="mt-2 text-slate-500">The requested tool does not exist.</p>
        <Link to="/tools" className="mt-4 inline-block text-brand-600 hover:underline">
          View all tools
        </Link>
      </div>
    );
  }

  if (tool.id === 'document-word-counter') {
    return (
      <ToolPageShell
        tool={tool}
        customPreview={
          <TextToolShell
            tool={tool}
            placeholder="Type or paste text here to see live word and character counts…"
            statsRenderer={(text) => {
              const stats = calculateWordStats(text);
              return (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      {stats.words}
                    </span>
                    <span className="text-[11px] text-slate-500">Words</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      {stats.charactersWithSpaces}
                    </span>
                    <span className="text-[11px] text-slate-500">Characters</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      {stats.charactersWithoutSpaces}
                    </span>
                    <span className="text-[11px] text-slate-500">No spaces</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      {stats.sentences}
                    </span>
                    <span className="text-[11px] text-slate-500">Sentences</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      {stats.paragraphs}
                    </span>
                    <span className="text-[11px] text-slate-500">Paragraphs</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
                    <span className="block text-xl font-bold text-slate-900 dark:text-white">
                      ~{stats.readingTimeMinutes}m
                    </span>
                    <span className="text-[11px] text-slate-500">Reading time</span>
                  </div>
                </div>
              );
            }}
          />
        }
      />
    );
  }

  if (tool.id === 'document-case-converter') {
    return (
      <ToolPageShell
        tool={tool}
        customPreview={
          <TextToolShell
            tool={tool}
            placeholder="Type or paste your text to convert case…"
            actionButtons={[
              { label: 'UPPERCASE', onClick: (text) => convertCase(text, 'upper') },
              { label: 'lowercase', onClick: (text) => convertCase(text, 'lower') },
              { label: 'Title Case', onClick: (text) => convertCase(text, 'title') },
              { label: 'Sentence case', onClick: (text) => convertCase(text, 'sentence') },
              { label: 'camelCase', onClick: (text) => convertCase(text, 'camel') },
              { label: 'snake_case', onClick: (text) => convertCase(text, 'snake') },
              { label: 'kebab-case', onClick: (text) => convertCase(text, 'kebab') },
            ]}
          />
        }
      />
    );
  }

  if (tool.id === 'developer-json-formatter') {
    return (
      <ToolPageShell
        tool={tool}
        customPreview={
          <TextToolShell
            tool={tool}
            placeholder="Paste your JSON here to format and validate…"
            customControls={
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Indent:
                  </span>
                  <select
                    value={jsonIndent}
                    onChange={(e) => setJsonIndent(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                    <option value="tab">Tabs</option>
                    <option value="min">Minify</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={jsonSortKeys}
                    onChange={(e) => setJsonSortKeys(e.target.checked)}
                    className="h-3.5 w-3.5 rounded text-brand-600"
                  />
                  <span>Sort keys</span>
                </label>
              </div>
            }
            actionButtons={[
              {
                label: 'Format JSON',
                primary: true,
                onClick: (text) => {
                  const res = formatJson(text, jsonIndent, jsonSortKeys);
                  return res.formatted;
                },
              },
            ]}
            outputTransform={(text) => {
              if (!text.trim()) return { text: '' };
              const res = formatJson(text, jsonIndent, jsonSortKeys);
              return { text: res.formatted, error: res.error };
            }}
          />
        }
      />
    );
  }

  if (tool.id === 'developer-base64') {
    return (
      <ToolPageShell
        tool={tool}
        customPreview={
          <TextToolShell
            tool={tool}
            placeholder="Enter text to encode or Base64 to decode…"
            customControls={
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1">
                    <input
                      type="radio"
                      name="base64Mode"
                      checked={base64Mode === 'encode'}
                      onChange={() => setBase64Mode('encode')}
                    />
                    <span>Encode</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-1">
                    <input
                      type="radio"
                      name="base64Mode"
                      checked={base64Mode === 'decode'}
                      onChange={() => setBase64Mode('decode')}
                    />
                    <span>Decode</span>
                  </label>
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={base64UrlSafe}
                    onChange={(e) => setBase64UrlSafe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded text-brand-600"
                  />
                  <span>URL-safe</span>
                </label>
              </div>
            }
            actionButtons={[
              {
                label: base64Mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64',
                primary: true,
                onClick: (text) => {
                  if (base64Mode === 'encode') {
                    return encodeBase64Text(text, base64UrlSafe);
                  } else {
                    try {
                      return decodeBase64Text(text);
                    } catch {
                      return text;
                    }
                  }
                },
              },
            ]}
          />
        }
      />
    );
  }

  if (tool.id === 'document-markdown-to-pdf') {
    return (
      <ToolPageShell
        tool={tool}
        customPreview={
          <TextToolShell
            tool={tool}
            initialText="# Welcome to EasyEdit Markdown\n\nEdit this markdown and see the live preview below.\n\n- Free & private\n- Runs 100% on your device\n- Crisp PDF output"
            placeholder="Type or paste Markdown here, or upload a .md file…"
            customControls={
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Theme:</span>
                  <select
                    value={mdTheme}
                    onChange={(e) => setMdTheme(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="clean">Clean (Sans-serif)</option>
                    <option value="academic">Academic (Serif)</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Page Size:</span>
                  <select
                    value={mdPageSize}
                    onChange={(e) => setMdPageSize(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">US Letter</option>
                  </select>
                </div>
              </div>
            }
            actionButtons={[
              {
                label: isCompilingMd ? 'Generating PDF…' : 'Create PDF',
                primary: true,
                onClick: async (text) => {
                  if (!text.trim()) return;
                  setIsCompilingMd(true);
                  try {
                    const res = await markdownToPdfProcessor.process({
                      files: [],
                      options: { text, theme: mdTheme, pageSize: mdPageSize },
                      signal: new AbortController().signal,
                      onProgress: () => {},
                    });
                    if (res.files[0]) {
                      downloadBlob(res.files[0].blob, res.files[0].name);
                    }
                  } catch (err) {
                    console.error('Markdown PDF generation error:', err);
                  } finally {
                    setIsCompilingMd(false);
                  }
                },
              },
            ]}
            statsRenderer={(text) => {
              const { sanitized } = renderMarkdownSafe(text || '*No markdown content*');
              return (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Live HTML Preview
                  </div>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitized }}
                  />
                </div>
              );
            }}
          />
        }
      />
    );
  }

  return <ToolPageShell tool={tool} />;
};

export default ToolPage;
