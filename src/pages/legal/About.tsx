import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        About EasyEdit
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        Free, private, instant file tools for everyone.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          Almost everyone frequently needs quick file chores done: combining multiple PDFs into one invoice,
          resizing a photo for an application form, extracting an archive, or formatting JSON data.
        </p>
        <p>
          Unfortunately, most online services force users through paywalls, ad-cluttered interfaces, invasive sign-ups,
          and worst of all: uploading sensitive personal files to unknown third-party cloud servers.
        </p>
        <p>
          We created <strong>EasyEdit</strong> to change that. By using modern client-side WebAssembly, Web Workers,
          and HTML5 APIs, your browser performs the conversions directly on your computer or phone.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="mt-2 font-bold text-slate-900 dark:text-white">Instant</h3>
            <p className="mt-1 text-xs text-slate-500">No waiting for slow uploads or queues.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="mt-2 font-bold text-slate-900 dark:text-white">100% Private</h3>
            <p className="mt-1 text-xs text-slate-500">Files stay strictly on your device.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Heart className="h-5 w-5 text-rose-500" />
            <h3 className="mt-2 font-bold text-slate-900 dark:text-white">Truly Free</h3>
            <p className="mt-1 text-xs text-slate-500">No watermarks, no account needed.</p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/tools"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus:outline-none"
          >
            Explore all tools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
