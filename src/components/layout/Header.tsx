import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Search, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/i18n';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
            aria-label="EasyEdit Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <span>EasyEdit</span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-4 text-sm font-medium">
            <Link
              to="/tools"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {t('global.allTools')}
            </Link>
            <Link
              to="/pdf"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              PDF
            </Link>
            <Link
              to="/image"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Image
            </Link>
            <Link
              to="/document"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Document
            </Link>
            <Link
              to="/developer"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Developer
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            aria-label="Open search dialog"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('global.searchPlaceholder')}</span>
            <span className="inline sm:hidden">Search</span>
            <kbd className="hidden rounded bg-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:inline-block">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={resolvedTheme === 'dark' ? t('global.lightMode') : t('global.darkMode')}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
