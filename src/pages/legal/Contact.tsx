import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Contact & Support
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        Have questions, feedback, or a tool request? We&apos;d love to hear from you.
      </p>

      <div className="mt-8 space-y-6">
        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Email Us</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              For general feedback, bug reports, and partnership inquiries:
            </p>
            <a
              href="mailto:support.easyedit@gmail.com"
              className="mt-2 inline-block font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              support.easyedit@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Security & Privacy Inquiries</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              For security vulnerability disclosures or data handling verification:
            </p>
            <a
              href="mailto:support.easyedit@gmail.com"
              className="mt-2 inline-block font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              support.easyedit@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
