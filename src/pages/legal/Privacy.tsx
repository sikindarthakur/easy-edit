import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: November 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Core Privacy Principle</h2>
          <p className="mt-2">
            EasyEdit is designed with a fundamental privacy-first architecture: we do not collect, upload, store, or transmit your files. All file manipulations (merging, splitting, resizing, converting, and compressing) occur entirely within your local browser on your personal device.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. No File Data Collection</h2>
          <p className="mt-2">
            Your files never reach our servers or any third-party cloud infrastructure. We have zero access to the contents, metadata, or names of the files you process.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Analytics and Cookies</h2>
          <p className="mt-2">
            We do not use tracking cookies or invasive third-party ad networks. Any operational metrics collected are aggregate, anonymized, and cookieless (e.g. page view counts) to ensure reliability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Local Storage</h2>
          <p className="mt-2">
            EasyEdit uses your browser&apos;s local storage strictly to remember your preferences (such as light or dark theme selection). No personal data is stored.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
