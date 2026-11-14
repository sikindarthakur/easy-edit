# Architecture & Design Decisions

This document records architectural, design, and technical decisions made during the development of EasyEdit according to PRD guidelines.

## DEC-001: 100% Client-Side Processing Architecture
- **Date**: 2026-11-13
- **Context**: PRD Section 0 and Section 12 require zero file bytes sent to any server. No backend in v1.0.
- **Decision**: All file transformations, conversions, and parsing run exclusively in the browser using Web Workers, Web APIs (Canvas, OffscreenCanvas, Streams), and client-side WebAssembly / JavaScript libraries (pdf-lib, pdfjs-dist, fflate, papaparse).
- **Consequences**: User files never leave their device. Zero hosting infrastructure costs for computation. Memory limits of client devices must be guarded.

## DEC-002: Technology Stack Selection
- **Date**: 2026-11-13
- **Context**: Need fast build, strict type safety, predictable testing, and high Lighthouse performance.
- **Decision**:
  - React 18 + Vite + TypeScript (strict mode).
  - Tailwind CSS for responsive styling, dark mode support via `class` strategy, and design tokens matching Section 9.2.
  - React Router DOM v6 for routing.
  - Vitest + React Testing Library for unit/component tests.
  - Playwright for E2E tests, cross-browser verification, and network-leak assertions.
- **Consequences**: Standard, robust ecosystem with minimal build friction and full tree-shaking.

## DEC-003: UI Copy and Design System Adherence
- **Date**: 2026-11-13
- **Context**: PRD Section 9 and Section 11 define exact UI copy, spacing (8px scale, 1200px max width), color scheme (neutral grays, blue accent #2563eb / #3b82f6, semantic tokens), and typography.
- **Decision**: Encapsulate all global and tool-specific copy in `src/i18n/en.json` conforming strictly to Section 11.

## DEC-004: Shared Tool Page Shell Architecture
- **Date**: 2026-11-13
- **Context**: PRD Section 0 and Section 9 forbid hand-building bespoke pages for each tool.
- **Decision**: Implemented `ToolPageShell` driven entirely by `ToolDefinition` metadata in `src/tools/registry.ts`. Tools with rich live-text interaction (`document-word-counter`, `document-case-converter`, `developer-json-formatter`, `developer-base64`, `document-markdown-to-pdf`) share `TextToolShell` within the same unified shell structure.

## DEC-005: File Format Validation via Magic Bytes & Buffer Guards
- **Date**: 2026-11-13
- **Context**: PRD FR-5 mandates file validation by binary signature (magic bytes), not file extension alone.
- **Decision**: Implemented `detectMagicBytes` and `validateFiles` in `src/lib/fileValidation.ts` checking PDF (`%PDF`), PNG (`89 50 4E 47`), JPEG (`FF D8 FF`), WebP (`RIFF...WEBP`), and ZIP (`PK\x03\x04`). Size and count limits are enforced prior to initiating any processing.

## DEC-006: Web Worker & Dynamic Code-Splitting Strategy
- **Date**: 2026-11-13
- **Context**: PRD Section 8.1 requires lazy-loading every tool and its libraries, with a home page initial JS budget under 150 KB gzip.
- **Decision**: Chunked heavy dependencies (`pdf-lib`, `pdfjs-dist`, `marked`, `dompurify`, `papaparse`, `fflate`) into dynamic imports loaded only when visiting tool routes. The initial home page JS bundle is 84.15 KB gzip, well under the 150 KB budget.

## DEC-007: Vector-Based Safe Markdown to PDF Compilation with DOMPurify
- **Date**: 2026-11-13
- **Context**: PRD Section 6.2 requires live preview, themes, page sizes, and HTML sanitization with DOMPurify for Markdown to PDF.
- **Decision**: Sanitized raw HTML with DOMPurify, extracted clean layout tokens, and generated crisp, selectable vector PDF documents using `pdf-lib` standard fonts with automatic multi-page pagination.

## DEC-008: Progressive Web App, Cloudflare Pages Security Headers, & Static Prerendering
- **Date**: 2026-11-14
- **Context**: PRD Section 6.1 (FR-14), Section 14.3, and Section 17 mandate offline PWA capabilities, strict security headers, and prerendering all routes for search indexability.
- **Decision**: Implemented `public/sw.js` with shell precaching and stale-while-revalidate asset caching, `public/manifest.json`, `public/_headers` with CSP, HSTS, frame-ancestors 'none', and `scripts/prerender.js` generating static HTML pages and `sitemap.xml`.

## DEC-009: Image Compression Format Retention (Actual / JPG / PNG)
- **Date**: 2026-11-14
- **Context**: Image compression previously converted PNG images to WebP. User requirement requested preserving actual image format (PNG, JPG) or allowing the user to select JPG or PNG format.
- **Decision**: Updated `src/tools/image/compress.ts` and `src/tools/registry.ts` to add an `outputFormat` selector defaulting to `original` (actual format). PNG files now retain `.png` format with transparent channel preservation, JPG files retain `.jpg`, and users can explicitly select JPG or PNG output format.

## DEC-010: Image Tool Scope Adjustment (Removal of Crop and Rotate & Flip)
- **Date**: 2026-11-14
- **Context**: User requested removing "Crop Image" (`/image/crop`) and "Rotate and Flip Image" (`/image/rotate`) from image tools.
- **Decision**: Completely removed `image-crop` and `image-rotate` from `src/tools/registry.ts`, `src/i18n/en.json`, tests, and prerender scripts. Image tools are now focused on Resize Image, Compress Image, and Convert Image. Total active launch tools updated to 18.
