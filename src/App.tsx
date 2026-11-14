import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { Layout } from '@/components/layout/Layout';

// Lazy loaded page components
const HomePage = lazy(() => import('@/pages/Home'));
const AllToolsPage = lazy(() => import('@/pages/AllTools'));
const CategoryPage = lazy(() => import('@/pages/Category'));
const ToolPage = lazy(() => import('@/pages/ToolPage'));
const AboutPage = lazy(() => import('@/pages/legal/About'));
const PrivacyPage = lazy(() => import('@/pages/legal/Privacy'));
const TermsPage = lazy(() => import('@/pages/legal/Terms'));
const ContactPage = lazy(() => import('@/pages/legal/Contact'));
const HowWeHandleFilesPage = lazy(() => import('@/pages/legal/HowWeHandleFiles'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

const LoadingFallback: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="tools" element={<AllToolsPage />} />
              
              {/* Category pages */}
              <Route path="pdf" element={<CategoryPage category="pdf" />} />
              <Route path="image" element={<CategoryPage category="image" />} />
              <Route path="document" element={<CategoryPage category="document" />} />
              <Route path="developer" element={<CategoryPage category="developer" />} />
              <Route path="spreadsheet" element={<CategoryPage category="spreadsheet" />} />
              <Route path="archive" element={<CategoryPage category="archive" />} />

              {/* Tool pages dynamic route */}
              <Route path=":category/:toolSlug" element={<ToolPage />} />

              {/* Info & Legal pages */}
              <Route path="about" element={<AboutPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="how-we-handle-files" element={<HowWeHandleFilesPage />} />

              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
