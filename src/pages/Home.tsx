import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  FileText,
  Image,
  Archive,
  Code,
  Table,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  HardDrive,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { t } from '@/i18n';
import { toolsRegistry } from '@/tools/registry';

// 8 Popular tools for the hero/popular section (PRD Section 7)
const POPULAR_TOOL_IDS = [
  'pdf-merge',
  'image-compress',
  'image-resize',
  'pdf-split',
  'pdf-to-image',
  'image-convert',
  'document-word-counter',
  'developer-json-formatter',
];

const HOME_FAQS = [
  {
    q: 'Is EasyEdit really free to use?',
    a: 'Yes, 100% free with no hidden subscriptions, watermarks, or account registration requirements.',
  },
  {
    q: 'Are my files uploaded to your servers?',
    a: 'No. All tools operate entirely client-side inside your browser via Web Workers and WebAssembly. Your files never touch our servers.',
  },
  {
    q: 'What are the file size limits?',
    a: 'Desktop users can process files up to 100 MB (up to 500 PDF pages or 100 megapixels). Mobile browsers are optimized for up to 50 MB to prevent mobile memory pressure.',
  },
  {
    q: 'Does EasyEdit work offline?',
    a: 'Yes. EasyEdit is a Progressive Web App (PWA). Once loaded, the core app shell and tools remain available even without an active internet connection.',
  },
];

export const HomePage: React.FC = () => {
  const [heroSearch, setHeroSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const popularTools = toolsRegistry.filter((tool) =>
    POPULAR_TOOL_IDS.includes(tool.id)
  );

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/tools?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-20 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-content px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Lock className="h-3.5 w-3.5" />
          <span>{t('global.privacyBadge')}</span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          {t('global.heroHeadline')}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
          {t('global.heroSubhead')}
        </p>

        {/* Universal Search in Hero */}
        <form
          onSubmit={handleHeroSearchSubmit}
          className="mx-auto mt-8 flex max-w-lg items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <Search className="ml-3 h-5 w-5 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
            placeholder={t('global.searchPlaceholder')}
            className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
            aria-label="Universal search"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-500"
          >
            Search
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {t('global.firstVisitTip')}
        </p>
      </section>

      {/* 8 Popular Tools Section */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {t('global.popularTools')}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Most frequently used everyday file utilities.
            </p>
          </div>
          <Link
            to="/tools"
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
          >
            <span>View all {toolsRegistry.length} tools</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.route}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {tool.category}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {tool.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                  {tool.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span>Start</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {t('global.browseByCategory')}
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            to="/pdf"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <FileText className="h-8 w-8 text-rose-500" />
            <span className="mt-3 font-semibold text-slate-900 dark:text-white">PDF</span>
            <span className="text-[11px] text-slate-500">7 tools</span>
          </Link>

          <Link
            to="/image"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <Image className="h-8 w-8 text-blue-500" />
            <span className="mt-3 font-semibold text-slate-900 dark:text-white">Image</span>
            <span className="text-[11px] text-slate-500">3 tools</span>
          </Link>

          <Link
            to="/document"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <FileText className="h-8 w-8 text-amber-500" />
            <span className="mt-3 font-semibold text-slate-900 dark:text-white">Document</span>
            <span className="text-[11px] text-slate-500">3 tools</span>
          </Link>

          <Link
            to="/developer"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <Code className="h-8 w-8 text-emerald-500" />
            <span className="mt-3 font-semibold text-slate-900 dark:text-white">Developer</span>
            <span className="text-[11px] text-slate-500">2 tools</span>
          </Link>

          <Link
            to="/spreadsheet"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <Table className="h-8 w-8 text-teal-500" />
            <span className="mt-3 font-semibold text-slate-900 dark:text-white">Spreadsheet</span>
            <span className="text-[11px] text-slate-500">1 tool</span>
          </Link>

          <Link
            to="/archive"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <Archive className="h-8 w-8 text-purple-500" />
            <span className="mt-3 font-semibold text-slate-900 dark:text-white">Archive</span>
            <span className="text-[11px] text-slate-500">2 tools</span>
          </Link>
        </div>
      </section>

      {/* How it works (3 steps) */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
          <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            How It Works
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {t('global.howItWorksStep1Title')}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t('global.howItWorksStep1Desc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {t('global.howItWorksStep2Title')}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t('global.howItWorksStep2Desc')}
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {t('global.howItWorksStep3Title')}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {t('global.howItWorksStep3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security Promise */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 dark:border-emerald-900/40 dark:bg-emerald-950/20 sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('global.privacyPromise')}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {t('global.privacyPromiseText')}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <EyeOff className="mt-0.5 h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Zero File Uploads
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Files are read and processed entirely inside browser memory.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Instant Local Speed
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  No queue delays, no network bottleneck or upload time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HardDrive className="mt-0.5 h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Originals Untouched
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Your source files remain completely untouched on your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('global.faq')}
        </h2>

        <div className="mt-8 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {HOME_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
