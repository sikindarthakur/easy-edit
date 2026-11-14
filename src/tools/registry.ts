import { ToolDefinition } from './types';

export const toolsRegistry: ToolDefinition[] = [
  // 1. Merge PDF
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    title: 'Merge PDF files',
    description: 'Combine several PDFs into one document, in the order you choose.',
    category: 'pdf',
    route: '/pdf/merge',
    keywords: ['combine', 'join', 'merge', 'bundle', 'pdf', 'unite'],
    acceptedFormats: ['.pdf', 'application/pdf'],
    multiple: true,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 20, maxPages: 500 },
    options: [],
    primaryActionLabel: 'Merge PDFs',
    steps: [
      'Choose or drag and drop multiple PDF files.',
      'Reorder your documents by dragging or using the arrow buttons.',
      'Click "Merge PDFs" and download your combined document instantly.',
    ],
    faq: [
      {
        q: 'Is it free to merge PDFs?',
        a: 'Yes, EasyEdit is 100% free with no watermarks or limits on downloads.',
      },
      {
        q: 'Are my PDF files uploaded to any server?',
        a: 'No. EasyEdit merges your files entirely within your web browser. Your documents never leave your device.',
      },
      {
        q: 'How many PDF files can I combine at once?',
        a: 'You can combine up to 20 PDF files totaling up to 500 pages.',
      },
    ],
    related: ['pdf-split', 'pdf-organize', 'pdf-rotate', 'pdf-compress'],
    enabled: true,
    load: () => import('./pdf/merge'),
  },

  // 2. Split PDF
  {
    id: 'pdf-split',
    name: 'Split PDF',
    title: 'Split a PDF',
    description: 'Pull out pages or divide a PDF into smaller files.',
    category: 'pdf',
    route: '/pdf/split',
    keywords: ['split', 'extract', 'separate', 'divide', 'pages', 'cut'],
    acceptedFormats: ['.pdf', 'application/pdf'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxPages: 500 },
    options: [
      {
        id: 'mode',
        label: 'Split Mode',
        type: 'radio',
        defaultValue: 'range',
        options: [
          { label: 'Page ranges (e.g. 1-3, 5)', value: 'range' },
          { label: 'Every N pages', value: 'every' },
          { label: 'Extract all pages separately', value: 'all' },
        ],
      },
      {
        id: 'ranges',
        label: 'Page Ranges',
        type: 'text',
        defaultValue: '1',
        placeholder: 'e.g. 1-3, 5, 8-10',
        helpText: 'Specify page numbers or ranges separated by commas.',
        dependsOn: { field: 'mode', value: 'range' },
      },
      {
        id: 'everyN',
        label: 'Split every N pages',
        type: 'number',
        defaultValue: 1,
        min: 1,
        max: 100,
        dependsOn: { field: 'mode', value: 'every' },
      },
    ],
    primaryActionLabel: 'Split PDF',
    steps: [
      'Select the PDF file you wish to split.',
      'Enter the page ranges or select how many pages per split file.',
      'Click "Split PDF" to download your separated PDFs or ZIP archive.',
    ],
    faq: [
      {
        q: 'Can I extract non-consecutive pages?',
        a: 'Yes! Simply specify pages like "1-3, 5, 8" to extract exactly the pages you need.',
      },
      {
        q: 'Is my document secure?',
        a: 'All splitting operations run inside your browser. No files are uploaded to our servers.',
      },
    ],
    related: ['pdf-merge', 'pdf-organize', 'pdf-rotate'],
    enabled: true,
    load: () => import('./pdf/split'),
  },

  // 3. Rotate PDF
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF',
    title: 'Rotate PDF pages',
    description: 'Turn pages the right way up, one by one or all at once.',
    category: 'pdf',
    route: '/pdf/rotate',
    keywords: ['rotate', 'turn', 'orientation', 'upside down', 'portrait', 'landscape'],
    acceptedFormats: ['.pdf', 'application/pdf'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxPages: 500 },
    options: [
      {
        id: 'angle',
        label: 'Rotation Angle',
        type: 'select',
        defaultValue: 90,
        options: [
          { label: '90° Clockwise', value: 90 },
          { label: '180° Half Turn', value: 180 },
          { label: '270° Counter-Clockwise', value: 270 },
        ],
      },
      {
        id: 'scope',
        label: 'Apply to',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'All pages', value: 'all' },
          { label: 'Odd pages only', value: 'odd' },
          { label: 'Even pages only', value: 'even' },
        ],
      },
    ],
    primaryActionLabel: 'Rotate PDF',
    steps: [
      'Upload the PDF you want to rotate.',
      'Choose your rotation angle and which pages to rotate.',
      'Click "Rotate PDF" and download the oriented document.',
    ],
    faq: [
      {
        q: 'Will rotating reduce PDF quality?',
        a: 'No. Rotating simply updates page metadata without re-encoding text or images.',
      },
    ],
    related: ['pdf-organize', 'pdf-merge', 'pdf-split'],
    enabled: true,
    load: () => import('./pdf/rotate'),
  },

  // 4. Organize PDF
  {
    id: 'pdf-organize',
    name: 'Organize PDF',
    title: 'Organize PDF pages',
    description: 'Reorder, delete or duplicate pages with a simple drag.',
    category: 'pdf',
    route: '/pdf/organize',
    keywords: ['organize', 'reorder', 'delete', 'duplicate', 'sort', 'arrange'],
    acceptedFormats: ['.pdf', 'application/pdf'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxPages: 500 },
    options: [],
    primaryActionLabel: 'Save PDF',
    steps: [
      'Add your PDF to generate page thumbnails.',
      'Drag pages to reorder, delete unnecessary pages, or duplicate pages.',
      'Click "Save PDF" to download your newly organized file.',
    ],
    faq: [
      {
        q: 'Can I remove blank pages?',
        a: 'Yes, just click the delete icon on any page thumbnail before saving.',
      },
    ],
    related: ['pdf-merge', 'pdf-rotate', 'pdf-split'],
    enabled: true,
    load: () => import('./pdf/organize'),
  },

  // 5. PDF to JPG/PNG
  {
    id: 'pdf-to-image',
    name: 'PDF to JPG/PNG',
    title: 'Convert PDF to images',
    description: 'Turn every page into a high-quality image.',
    category: 'pdf',
    route: '/pdf/to-image',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'extract images', 'rasterize'],
    acceptedFormats: ['.pdf', 'application/pdf'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxPages: 100 },
    options: [
      {
        id: 'format',
        label: 'Image Format',
        type: 'select',
        defaultValue: 'jpeg',
        options: [
          { label: 'JPG (Smaller size)', value: 'jpeg' },
          { label: 'PNG (Lossless quality)', value: 'png' },
        ],
      },
      {
        id: 'dpi',
        label: 'Resolution (DPI)',
        type: 'select',
        defaultValue: 150,
        options: [
          { label: '72 DPI (Screen standard)', value: 72 },
          { label: '150 DPI (Balanced)', value: 150 },
          { label: '300 DPI (Print quality)', value: 300 },
        ],
      },
    ],
    primaryActionLabel: 'Convert to images',
    steps: [
      'Select your PDF document.',
      'Pick JPG or PNG and select resolution.',
      'Click "Convert to images" to download your images in a ZIP file.',
    ],
    faq: [
      {
        q: 'Are all pages converted?',
        a: 'Yes! Every page is rendered and packaged into a convenient ZIP archive.',
      },
    ],
    related: ['pdf-from-image', 'image-convert', 'pdf-compress'],
    enabled: true,
    load: () => import('./pdf/toImage'),
  },

  // 6. Image to PDF
  {
    id: 'pdf-from-image',
    name: 'Image to PDF',
    title: 'Convert images to PDF',
    description: 'Put your photos or scans into one PDF.',
    category: 'pdf',
    route: '/pdf/from-image',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photos to pdf', 'scan to pdf'],
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    multiple: true,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 20 },
    options: [
      {
        id: 'pageSize',
        label: 'Page Size',
        type: 'select',
        defaultValue: 'fit',
        options: [
          { label: 'Fit to image', value: 'fit' },
          { label: 'A4', value: 'a4' },
          { label: 'US Letter', value: 'letter' },
        ],
      },
      {
        id: 'orientation',
        label: 'Orientation',
        type: 'select',
        defaultValue: 'portrait',
        options: [
          { label: 'Portrait', value: 'portrait' },
          { label: 'Landscape', value: 'landscape' },
          { label: 'Auto (match image)', value: 'auto' },
        ],
      },
      {
        id: 'margin',
        label: 'Margin',
        type: 'select',
        defaultValue: 'none',
        options: [
          { label: 'No margin', value: 'none' },
          { label: 'Small (10mm)', value: 'small' },
          { label: 'Big (20mm)', value: 'big' },
        ],
      },
    ],
    primaryActionLabel: 'Create PDF',
    steps: [
      'Choose or drag image files (JPG, PNG, WebP).',
      'Reorder them to match your desired page order.',
      'Choose page size, orientation, and margin, then click "Create PDF".',
    ],
    faq: [
      {
        q: 'Can I combine multiple pictures into a single PDF?',
        a: 'Yes, add up to 20 photos and they will be compiled into one multi-page PDF.',
      },
    ],
    related: ['pdf-to-image', 'pdf-merge', 'image-resize'],
    enabled: true,
    load: () => import('./pdf/fromImage'),
  },

  // 7. Resize Image
  {
    id: 'image-resize',
    name: 'Resize Image',
    title: 'Resize image',
    description: 'Set an exact size in pixels or percent.',
    category: 'image',
    route: '/image/resize',
    keywords: ['resize', 'dimensions', 'width', 'height', 'scale', 'shrink photo', 'pixels'],
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxMegapixels: 100 },
    options: [
      {
        id: 'mode',
        label: 'Resize Mode',
        type: 'radio',
        defaultValue: 'pixels',
        options: [
          { label: 'By Pixels', value: 'pixels' },
          { label: 'By Percentage', value: 'percent' },
          { label: 'Preset', value: 'preset' },
        ],
      },
      {
        id: 'width',
        label: 'Width (px)',
        type: 'number',
        defaultValue: 1920,
        min: 1,
        max: 10000,
        dependsOn: { field: 'mode', value: 'pixels' },
      },
      {
        id: 'height',
        label: 'Height (px)',
        type: 'number',
        defaultValue: 1080,
        min: 1,
        max: 10000,
        dependsOn: { field: 'mode', value: 'pixels' },
      },
      {
        id: 'lockAspect',
        label: 'Maintain aspect ratio',
        type: 'checkbox',
        defaultValue: true,
        dependsOn: { field: 'mode', value: 'pixels' },
      },
      {
        id: 'percent',
        label: 'Scale (%)',
        type: 'range',
        defaultValue: 50,
        min: 10,
        max: 200,
        step: 5,
        dependsOn: { field: 'mode', value: 'percent' },
      },
      {
        id: 'preset',
        label: 'Preset Dimension',
        type: 'select',
        defaultValue: '1920x1080',
        options: [
          { label: 'Full HD (1920×1080)', value: '1920x1080' },
          { label: 'Instagram Square (1080×1080)', value: '1080x1080' },
          { label: 'Passport Photo (600×600)', value: '600x600' },
          { label: 'Web Banner (1200×630)', value: '1200x630' },
        ],
        dependsOn: { field: 'mode', value: 'preset' },
      },
      {
        id: 'format',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'keep',
        options: [
          { label: 'Same as input', value: 'keep' },
          { label: 'JPEG', value: 'image/jpeg' },
          { label: 'PNG', value: 'image/png' },
          { label: 'WebP', value: 'image/webp' },
        ],
      },
      {
        id: 'quality',
        label: 'Quality',
        type: 'range',
        defaultValue: 90,
        min: 10,
        max: 100,
        step: 5,
      },
    ],
    primaryActionLabel: 'Resize image',
    steps: [
      'Select or drop your image.',
      'Enter new width/height or choose a percentage or preset.',
      'Click "Resize image" and download your perfectly scaled photo.',
    ],
    faq: [
      {
        q: 'Will my image lose quality?',
        a: 'We use high-quality canvas bicubic resampling so your resized images stay crisp and clear.',
      },
    ],
    related: ['image-compress', 'image-convert'],
    enabled: true,
    load: () => import('./image/resize'),
  },

  // 8. Compress Image
  {
    id: 'image-compress',
    name: 'Compress Image',
    title: 'Compress image',
    description: 'Shrink file size while keeping it looking great.',
    category: 'image',
    route: '/image/compress',
    keywords: ['compress', 'shrink', 'optimize', 'reduce size', 'photo size', 'kb'],
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxMegapixels: 100 },
    options: [
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'original',
        options: [
          { label: 'Original format (Auto)', value: 'original' },
          { label: 'JPG format', value: 'image/jpeg' },
          { label: 'PNG format', value: 'image/png' },
        ],
        helpText: 'Preserve the original format or choose JPG or PNG.',
      },
      {
        id: 'quality',
        label: 'Quality Level',
        type: 'range',
        defaultValue: 75,
        min: 10,
        max: 100,
        step: 5,
        helpText: 'Lower quality produces smaller files.',
      },
      {
        id: 'targetKb',
        label: 'Target Size (KB, optional)',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 50000,
        placeholder: 'e.g. 200 (leave 0 for quality slider)',
      },
      {
        id: 'stripExif',
        label: 'Strip EXIF metadata (recommended for privacy)',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
    primaryActionLabel: 'Compress image',
    steps: [
      'Upload the photo you want to shrink.',
      'Adjust the quality slider or set a target size in KB.',
      'Click "Compress image" to see size savings and download.',
    ],
    faq: [
      {
        q: 'How much can I reduce my image size?',
        a: 'Most images can be compressed by 50% to 80% with virtually no noticeable loss in visual quality.',
      },
    ],
    related: ['image-resize', 'image-convert', 'pdf-compress'],
    enabled: true,
    load: () => import('./image/compress'),
  },

  // 9. Convert Image
  {
    id: 'image-convert',
    name: 'Convert Image (JPG, PNG, WebP)',
    title: 'Convert image',
    description: 'Switch between JPG, PNG and WebP.',
    category: 'image',
    route: '/image/convert',
    keywords: ['convert', 'jpg to png', 'png to jpg', 'webp to png', 'transparency', 'format'],
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp', 'image/*'],
    multiple: true,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 20 },
    options: [
      {
        id: 'targetFormat',
        label: 'Convert To',
        type: 'select',
        defaultValue: 'image/png',
        options: [
          { label: 'PNG (Supports transparency)', value: 'image/png' },
          { label: 'JPG (Universal format)', value: 'image/jpeg' },
          { label: 'WebP (Modern web format)', value: 'image/webp' },
        ],
      },
      {
        id: 'quality',
        label: 'Quality (for JPG & WebP)',
        type: 'range',
        defaultValue: 90,
        min: 10,
        max: 100,
        step: 5,
      },
    ],
    primaryActionLabel: 'Convert image',
    steps: [
      'Upload images in JPG, PNG, or WebP format.',
      'Select your target format.',
      'Click "Convert image" and download your converted files.',
    ],
    faq: [
      {
        q: 'What happens to transparency when converting PNG to JPG?',
        a: 'Because JPG does not support transparent layers, transparent areas will automatically become clean white.',
      },
    ],
    related: ['image-compress', 'image-resize', 'pdf-from-image'],
    enabled: true,
    load: () => import('./image/convert'),
  },

  // 10. Word Counter
  {
    id: 'document-word-counter',
    name: 'Word Counter',
    title: 'Word counter',
    description: 'Count words, characters and reading time as you type.',
    category: 'document',
    route: '/document/word-counter',
    keywords: ['word counter', 'character count', 'reading time', 'paragraphs', 'sentences'],
    acceptedFormats: ['.txt', '.md', 'text/*'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 20, maxFiles: 1 },
    options: [],
    primaryActionLabel: '',
    isTextTool: true,
    steps: [
      'Type or paste your text into the editor below, or upload a text file.',
      'View real-time counts for words, characters, sentences, paragraphs, and reading time.',
    ],
    faq: [
      {
        q: 'How is reading time calculated?',
        a: 'Reading time is calculated using the standard average reading speed of 200 words per minute.',
      },
    ],
    related: ['document-case-converter', 'document-markdown-to-pdf'],
    enabled: true,
    load: () => import('./document/wordCounter'),
  },

  // 11. Case Converter
  {
    id: 'document-case-converter',
    name: 'Case Converter',
    title: 'Case converter',
    description: 'Change text to uppercase, lowercase, title case and more.',
    category: 'document',
    route: '/document/case-converter',
    keywords: ['case converter', 'uppercase', 'lowercase', 'title case', 'camelcase', 'snake_case', 'kebab-case'],
    acceptedFormats: ['.txt', 'text/*'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 20, maxFiles: 1 },
    options: [],
    primaryActionLabel: '',
    isTextTool: true,
    steps: [
      'Type or paste your text.',
      'Click any case conversion button (UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case).',
      'Copy the converted text to your clipboard with one click.',
    ],
    faq: [
      {
        q: 'Does it support programming naming conventions?',
        a: 'Yes, it supports camelCase, snake_case, PascalCase, and kebab-case for developers.',
      },
    ],
    related: ['document-word-counter', 'developer-json-formatter'],
    enabled: true,
    load: () => import('./document/caseConverter'),
  },

  // 12. JSON Formatter and Validator
  {
    id: 'developer-json-formatter',
    name: 'JSON Formatter and Validator',
    title: 'JSON formatter and validator',
    description: 'Make JSON readable and find errors fast.',
    category: 'developer',
    route: '/developer/json-formatter',
    keywords: ['json formatter', 'beautify json', 'minify json', 'validate json', 'json parser'],
    acceptedFormats: ['.json', 'application/json', 'text/*'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 50, maxFiles: 1 },
    options: [
      {
        id: 'indent',
        label: 'Indentation',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: '2 spaces', value: '2' },
          { label: '4 spaces', value: '4' },
          { label: 'Tabs', value: 'tab' },
          { label: 'Minified (Compact)', value: 'min' },
        ],
      },
      {
        id: 'sortKeys',
        label: 'Sort object keys alphabetically',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
    primaryActionLabel: 'Format',
    isTextTool: true,
    steps: [
      'Paste your raw JSON or upload a .json file.',
      'Select formatting options such as indent width or sort keys.',
      'Click "Format" to validate syntax and pretty-print.',
    ],
    faq: [
      {
        q: 'What if my JSON has syntax errors?',
        a: 'EasyEdit pinpoints the exact line and column number of syntax errors so you can quickly fix them.',
      },
    ],
    related: ['developer-base64', 'spreadsheet-csv-json'],
    enabled: true,
    load: () => import('./developer/jsonFormatter'),
  },

  // 13. Base64 Encode/Decode
  {
    id: 'developer-base64',
    name: 'Base64 Encode/Decode',
    title: 'Base64 encode and decode',
    description: 'Convert text or files to and from Base64.',
    category: 'developer',
    route: '/developer/base64',
    keywords: ['base64', 'encode', 'decode', 'binary', 'ascii', 'data url'],
    acceptedFormats: ['*'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 50, maxFiles: 1 },
    options: [
      {
        id: 'mode',
        label: 'Action',
        type: 'radio',
        defaultValue: 'encode',
        options: [
          { label: 'Encode', value: 'encode' },
          { label: 'Decode', value: 'decode' },
        ],
      },
      {
        id: 'urlSafe',
        label: 'URL-safe Base64 (- and _)',
        type: 'checkbox',
        defaultValue: false,
      },
    ],
    primaryActionLabel: 'Convert',
    isTextTool: true,
    steps: [
      'Enter text or upload any file.',
      'Choose whether to Encode or Decode.',
      'Click "Convert" to generate the Base64 representation or restored data.',
    ],
    faq: [
      {
        q: 'Can I encode images or binary files?',
        a: 'Yes! Upload any file and EasyEdit will generate a complete Base64 string or Data URL.',
      },
    ],
    related: ['developer-json-formatter', 'spreadsheet-csv-json'],
    enabled: true,
    load: () => import('./developer/base64'),
  },

  // 14. CSV ⇄ JSON
  {
    id: 'spreadsheet-csv-json',
    name: 'CSV ⇄ JSON',
    title: 'CSV and JSON converter',
    description: 'Switch between spreadsheet data and JSON.',
    category: 'spreadsheet',
    route: '/spreadsheet/csv-json',
    keywords: ['csv to json', 'json to csv', 'excel', 'convert spreadsheet', 'table'],
    acceptedFormats: ['.csv', '.json', 'text/csv', 'application/json'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 50, maxFiles: 1 },
    options: [
      {
        id: 'direction',
        label: 'Conversion Direction',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { label: 'Auto-detect from file', value: 'auto' },
          { label: 'CSV to JSON', value: 'csv2json' },
          { label: 'JSON to CSV', value: 'json2csv' },
        ],
      },
      {
        id: 'hasHeader',
        label: 'First row contains headers',
        type: 'checkbox',
        defaultValue: true,
      },
    ],
    primaryActionLabel: 'Convert',
    steps: [
      'Upload your CSV or JSON file.',
      'Review the first 50 rows in the instant table preview.',
      'Click "Convert" and download your converted spreadsheet or JSON.',
    ],
    faq: [
      {
        q: 'How are delimiters handled?',
        a: 'EasyEdit automatically detects commas, tabs, semicolons, and pipes.',
      },
    ],
    related: ['developer-json-formatter', 'developer-base64'],
    enabled: true,
    load: () => import('./spreadsheet/csvJson'),
  },

  // 15. Compress PDF (basic, browser) - P1
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    title: 'Compress PDF',
    description: 'Make your PDF smaller so it\'s easy to email or upload.',
    category: 'pdf',
    route: '/pdf/compress',
    keywords: ['compress pdf', 'shrink pdf', 'reduce pdf size', 'optimize pdf'],
    acceptedFormats: ['.pdf', 'application/pdf'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1, maxPages: 200 },
    options: [
      {
        id: 'compressionMode',
        label: 'Compression Level',
        type: 'select',
        defaultValue: 'light',
        options: [
          { label: 'Light (Lossless re-save, text remains selectable)', value: 'light' },
          { label: 'Strong (Re-render as images, smaller file)', value: 'strong' },
        ],
      },
    ],
    primaryActionLabel: 'Compress PDF',
    steps: [
      'Upload your PDF document.',
      'Choose Light (lossless) or Strong compression.',
      'Click "Compress PDF" and download the optimized file.',
    ],
    faq: [
      {
        q: 'What is the difference between Light and Strong compression?',
        a: 'Light compression cleans PDF streams losslessly without affecting text or images. Strong compression re-renders pages at optimized resolution for maximum size savings.',
      },
    ],
    related: ['pdf-merge', 'pdf-to-image', 'image-compress'],
    enabled: true,
    load: () => import('./pdf/compress'),
  },

  // 16. ZIP Creator - P1
  {
    id: 'archive-zip-create',
    name: 'ZIP Creator',
    title: 'Create a ZIP file',
    description: 'Bundle files into one compressed archive.',
    category: 'archive',
    route: '/archive/zip-create',
    keywords: ['zip', 'create zip', 'archive', 'compress files', 'bundle'],
    acceptedFormats: ['*'],
    multiple: true,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 20 },
    options: [
      {
        id: 'zipName',
        label: 'Archive Name',
        type: 'text',
        defaultValue: 'archive.zip',
        placeholder: 'archive.zip',
      },
      {
        id: 'compressionLevel',
        label: 'Compression Level',
        type: 'select',
        defaultValue: '6',
        options: [
          { label: 'Fast (Level 1)', value: '1' },
          { label: 'Standard (Level 6)', value: '6' },
          { label: 'Maximum (Level 9)', value: '9' },
          { label: 'Store (No compression)', value: '0' },
        ],
      },
    ],
    primaryActionLabel: 'Create ZIP',
    steps: [
      'Select or drop multiple files of any type.',
      'Choose an archive name and compression level.',
      'Click "Create ZIP" to download your archive instantly.',
    ],
    faq: [
      {
        q: 'Are any files uploaded?',
        a: 'No, all compression is done in WebAssembly/JavaScript right in your browser.',
      },
    ],
    related: ['archive-zip-extract'],
    enabled: true,
    load: () => import('./archive/zipCreate'),
  },

  // 17. ZIP Extractor - P1
  {
    id: 'archive-zip-extract',
    name: 'ZIP Extractor',
    title: 'Open a ZIP file',
    description: 'See what\'s inside and extract the files you want.',
    category: 'archive',
    route: '/archive/zip-extract',
    keywords: ['unzip', 'zip extractor', 'open zip', 'decompress', 'extract archive'],
    acceptedFormats: ['.zip', 'application/zip'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 100, maxFiles: 1 },
    options: [],
    primaryActionLabel: 'Extract',
    steps: [
      'Upload a .zip file.',
      'Browse the files and folders inside the archive.',
      'Extract all files or select individual files to download.',
    ],
    faq: [
      {
        q: 'Is it safe from zip bombs and path traversal?',
        a: 'Yes, EasyEdit validates file headers, rejects path traversal (../), and limits maximum uncompressed size for safety.',
      },
    ],
    related: ['archive-zip-create'],
    enabled: true,
    load: () => import('./archive/zipExtract'),
  },

  // 18. Markdown to PDF - P1
  {
    id: 'document-markdown-to-pdf',
    name: 'Markdown to PDF',
    title: 'Markdown to PDF',
    description: 'Turn your Markdown into a clean PDF.',
    category: 'document',
    route: '/document/markdown-to-pdf',
    keywords: ['markdown to pdf', 'md to pdf', 'convert markdown', 'pdf generator'],
    acceptedFormats: ['.md', '.txt', 'text/markdown'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 20, maxFiles: 1 },
    options: [
      {
        id: 'theme',
        label: 'Theme Style',
        type: 'select',
        defaultValue: 'clean',
        options: [
          { label: 'Clean (Default)', value: 'clean' },
          { label: 'Academic (Serif)', value: 'academic' },
          { label: 'Modern (Sans-serif)', value: 'modern' },
        ],
      },
      {
        id: 'pageSize',
        label: 'Page Size',
        type: 'select',
        defaultValue: 'a4',
        options: [
          { label: 'A4', value: 'a4' },
          { label: 'US Letter', value: 'letter' },
        ],
      },
    ],
    primaryActionLabel: 'Create PDF',
    isTextTool: true,
    steps: [
      'Type or paste Markdown, or upload a .md file.',
      'Preview rendered formatting live with syntax highlighting.',
      'Click "Create PDF" to print or download a clean document.',
    ],
    faq: [
      {
        q: 'Is HTML inside Markdown sanitized?',
        a: 'Yes, all rendered HTML is sanitized with DOMPurify to prevent malicious script injection.',
      },
    ],
    related: ['document-word-counter', 'pdf-merge'],
    enabled: true,
    load: () => import('./document/markdownToPdf'),
  },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return toolsRegistry.find((tool) => tool.id === id);
}

export function getToolByRoute(route: string): ToolDefinition | undefined {
  return toolsRegistry.find((tool) => tool.route === route);
}
