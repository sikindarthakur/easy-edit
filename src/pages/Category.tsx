import React from 'react';
import { Link } from 'react-router-dom';
import { toolsRegistry } from '@/tools/registry';
import { ToolCategory } from '@/tools/types';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { t } from '@/i18n';

interface CategoryPageProps {
  category: ToolCategory;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ category }) => {
  const categoryTools = toolsRegistry.filter(
    (tool) => tool.category === category && tool.enabled
  );

  const categoryTitle = t(`categories.${category}`);

  return (
    <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {categoryTitle} Tools
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Fast, private {categoryTitle} processing directly inside your browser.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryTools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.route}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {tool.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Local
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {tool.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
              <span>Open tool</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
