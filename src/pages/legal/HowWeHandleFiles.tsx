import React from 'react';
import { ShieldCheck, HardDrive, Cpu, EyeOff, Lock } from 'lucide-react';

export const HowWeHandleFilesPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        <Lock className="h-3 w-3" />
        <span>100% Client-Side Architecture</span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        How We Handle Your Files
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        The short answer: we don&apos;t. Your files never leave your device.
      </p>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Browser-First Processing
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Unlike traditional file conversion sites that upload your sensitive documents to remote servers,
            EasyEdit uses modern WebAssembly and Web Worker technologies to process everything right inside your browser.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <EyeOff className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Zero Server Uploads
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            When you select a file or drop it into EasyEdit, no network request containing file data or file names
            is sent anywhere. You can verify this anytime by opening your browser&apos;s Developer Tools Network tab.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <HardDrive className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Original Files Are Safe
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            EasyEdit never modifies your original files on disk. Output files are created in your browser&apos;s temporary memory
            and downloaded with an &ldquo;-easyedit&rdquo; suffix when you click Download.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No Sign-Up or Tracking
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            We don&apos;t ask for your email, we don&apos;t require accounts, and we don&apos;t use tracking cookies.
            EasyEdit is free, private, and instant.
          </p>
        </section>
      </div>
    </div>
  );
};

export default HowWeHandleFilesPage;
