import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { t } from '@/i18n';
import { searchTools, ToolSearchResult } from '@/tools/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ToolSearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(searchTools(''));
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setResults(searchTools(query));
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent px-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
            placeholder={t('global.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tools"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((tool) => (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTool(tool.route)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {tool.description}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() !== '' ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('global.searchEmpty', { query })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
