import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Cpu, Globe } from 'lucide-react';
import { t } from '@/i18n';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <span>EasyEdit</span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {t('global.siteTagline')}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Lock className="h-4 w-4" />
              <span>{t('global.privacyBadge')}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Categories
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/pdf" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  PDF Tools
                </Link>
              </li>
              <li>
                <Link to="/image" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Image Tools
                </Link>
              </li>
              <li>
                <Link to="/document" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Document Tools
                </Link>
              </li>
              <li>
                <Link to="/developer" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link to="/spreadsheet" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Spreadsheet Tools
                </Link>
              </li>
              <li>
                <Link to="/archive" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Archive Tools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trust & Privacy
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/how-we-handle-files" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  How we handle files
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tech
            </h3>
            <div className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-brand-500" />
                <span>Client-side Web Workers</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-500" />
                <span>Works offline (PWA)</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-amber-500" />
                <span>Zero server telemetry of files</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>{t('global.footer')}</p>
        </div>
      </div>
    </footer>
  );
};
