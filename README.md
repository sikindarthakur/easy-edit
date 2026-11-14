# EasyEdit 🛠️

> **Edit, convert, and compress files. Free. Private. Instant.**

EasyEdit is an honest, privacy-first web utility suite for everyday file tasks. Most file converter websites upload your personal documents to remote servers with ambiguous retention policies, slow queues, and file size limits. 

EasyEdit works differently: **100% of the processing happens directly on your device** inside your browser using Web Workers and WebAssembly. Your files are never uploaded to any server.

---

## ✨ Key Highlights

- 🔒 **100% Private by Design**: Files stay in your browser’s local memory. Zero bytes are uploaded to remote servers.
- ⚡ **Instant Local Processing**: Powered by client-side Web Workers and WebAssembly for instant processing without network wait times.
- 🚫 **No Accounts, No Ads, No Watermarks**: Open a tool, process your files, and download the result. No sign-up or paywalls.
- 📦 **18 Essential Everyday Tools**: Comprehensive PDF, image, text, developer, spreadsheet, and archive utilities.
- 📶 **Works Offline (PWA)**: Equipped with a service worker that caches the application shell and tool bundles for offline use.
- ♿ **Accessible & Responsive**: Fully responsive UI adhering to WCAG 2.1 AA contrast standards with system-aware dark mode.

---

## 🧰 Available Tools (18 Tools)

### 📄 PDF Utilities
| Tool | Route | Description |
| :--- | :--- | :--- |
| **Merge PDF** | `/pdf/merge` | Combine up to 20 PDFs into a single document with drag-and-drop reordering. |
| **Split PDF** | `/pdf/split` | Split by custom ranges (`1-3, 5`), every N pages, or visual selection. |
| **Rotate PDF** | `/pdf/rotate` | Rotate individual pages or entire documents in 90° increments. |
| **Organize PDF** | `/pdf/organize` | Visual thumbnail grid to reorder, duplicate, rotate, and delete pages. |
| **PDF to JPG/PNG** | `/pdf/to-image` | Render PDF pages to high-resolution JPEG or PNG images (72, 150, 300 DPI). |
| **Image to PDF** | `/pdf/from-image` | Convert images into standard A4, Letter, or Fit-to-image PDFs. |
| **Compress PDF** | `/pdf/compress` | Basic browser-side compression via metadata stripping and object re-saving. |

### 🖼️ Image Utilities
| Tool | Route | Description |
| :--- | :--- | :--- |
| **Resize Image** | `/image/resize` | Scale by exact pixels, percentages, or presets (1080p, 1920p, passport) with aspect-ratio locking. |
| **Compress Image** | `/image/compress` | Quality slider with live size estimates; supports PNG, JPG, or original format download. |
| **Convert Image** | `/image/convert` | Fast batch image format conversion between JPG, PNG, and WebP. |

### 📝 Document & Text Tools
| Tool | Route | Description |
| :--- | :--- | :--- |
| **Word Counter** | `/document/word-counter` | Live metrics for words, characters (with/without spaces), sentences, paragraphs, and reading time. |
| **Case Converter** | `/document/case-converter` | One-click transformation between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case. |
| **Markdown to PDF** | `/document/markdown-to-pdf` | Live-preview Markdown editor sanitized with DOMPurify that compiles cleanly into PDF. |

### 💻 Developer Tools
| Tool | Route | Description |
| :--- | :--- | :--- |
| **JSON Formatter** | `/developer/json-formatter` | Format (2/4 spaces, tabs), minify, sort keys, and validate JSON with exact line/column syntax errors. |
| **Base64 Encode/Decode** | `/developer/base64` | Fast encoding and decoding for both raw text and binary files with URL-safe options. |

### 📊 Spreadsheet & Data Tools
| Tool | Route | Description |
| :--- | :--- | :--- |
| **CSV ⇄ JSON** | `/spreadsheet/csv-json` | Bidirectional converter with auto-delimiter detection, header row toggling, and live preview table. |

### 🗄️ Archive Tools
| Tool | Route | Description |
| :--- | :--- | :--- |
| **ZIP Creator** | `/archive/zip-create` | Bundle multiple files into a compressed `.zip` archive on device. |
| **ZIP Extractor** | `/archive/zip-extract` | Safely inspect and extract ZIP files with built-in path-traversal and zip bomb defenses. |

---

## 🏗️ Technical Architecture

- **Core Framework**: React 18, Vite, TypeScript (strict mode)
- **Styling**: Tailwind CSS, Lucide React icons
- **Client-Side Engines**:
  - **PDF**: `pdf-lib` (document assembly) + `pdfjs-dist` (canvas thumbnail rendering)
  - **Image Processing**: HTML5 Canvas & `OffscreenCanvas`
  - **Archives**: `fflate` (lightweight, memory-efficient streaming compression)
  - **Spreadsheets**: `papaparse`
  - **Markdown**: `marked` + `DOMPurify` sanitizer
  - **Search**: `fuse.js` typo-tolerant client-side index
- **Prerendering**: Static HTML generation script (`scripts/prerender.js`) prerenders all 31 routes at build time for fast initial load and SEO indexing.
- **Safety & Verification**: Magic-byte signature verification prevents mime-spoofing; strict memory and dimension limits protect against browser crashes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `18.0.0` or higher
- npm (or yarn / pnpm)

### Installation
```bash
git clone https://github.com/sikindarthakur/easy-edit.git
cd easy-edit
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Build
Compile TypeScript, build with Vite, and generate prerendered static pages:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🧪 Testing & Quality Assurance

EasyEdit maintains complete test coverage across unit tests and end-to-end browser tests:

```bash
# Run ESLint
npm run lint

# Run TypeScript strict type-check
npm run type-check

# Run unit tests with Vitest (45 tests)
npm run test

# Run end-to-end browser tests with Playwright (57 tests)
npm run test:e2e
```

---

## 🌐 Deployment

Because EasyEdit is a 100% static application, it can be hosted on any static edge hosting platform:

### Deploy on Vercel
Configuration is pre-built in [`vercel.json`](./vercel.json).
```bash
# Deploy via Vercel CLI
npx vercel

# Or push to GitHub and import the repository into your Vercel Dashboard.
```

### Deploy on Cloudflare Pages
Pre-configured with [`public/_headers`](./public/_headers) and [`public/_redirects`](./public/_redirects):
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🛡️ Security & Privacy Guarantee

EasyEdit is engineered around a strict privacy-first model:
1. **Zero File Uploads**: Verify this at any time by opening DevTools (`F12`), navigating to the **Network** tab, and observing that no file payloads are ever transmitted.
2. **Path Traversal Protection**: Archive extraction blocks `../`, absolute paths, and malformed directory descriptors.
3. **Zip Bomb Prevention**: Compression ratio limits prevent memory exhaustion during extraction.
4. **Content Security Policy**: Pre-configured headers restrict scripts, styles, and frames to `'self'` and trusted local memory blob URIs.

---

## 📄 License

MIT License. Free for personal and commercial use.

