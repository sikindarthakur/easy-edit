import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: November 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Use of the Service</h2>
          <p className="mt-2">
            EasyEdit is provided as a free, browser-based utility service. You may use our tools for personal, educational, and commercial purposes without charge or watermarks.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Intellectual Property</h2>
          <p className="mt-2">
            You retain 100% ownership and copyright of all files and content processed using EasyEdit. EasyEdit claims no rights, licenses, or title to any files handled by the user.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Disclaimer of Warranties</h2>
          <p className="mt-2">
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. While we rigorously test all file algorithms, you are encouraged to maintain independent backups of all important documents.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
