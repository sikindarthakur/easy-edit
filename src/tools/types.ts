export type ToolCategory = 'pdf' | 'image' | 'document' | 'developer' | 'spreadsheet' | 'archive';

export type OptionFieldType = 'select' | 'number' | 'text' | 'checkbox' | 'range' | 'radio' | 'textarea';

export interface OptionChoice {
  label: string;
  value: string | number;
}

export interface OptionField {
  id: string;
  label: string;
  type: OptionFieldType;
  defaultValue: unknown;
  options?: OptionChoice[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  dependsOn?: { field: string; value: unknown };
}

export interface ToolLimits {
  maxFileMB: number;
  maxFiles: number;
  maxPages?: number;
  maxMegapixels?: number;
}

export interface ProcessingContext {
  files: File[];
  options: Record<string, unknown>;
  signal: AbortSignal;
  onProgress: (percent: number, label?: string) => void;
}

export interface OutputFile {
  name: string;
  blob: Blob;
  previewUrl?: string;
}

export interface ToolResult {
  files: OutputFile[];
  stats?: {
    inputBytes: number;
    outputBytes: number;
  };
  notes?: string[];
}

export interface ToolProcessor {
  process(ctx: ProcessingContext): Promise<ToolResult>;
}

export interface ToolDefinition {
  id: string;                 // e.g. "pdf-merge"
  name: string;               // e.g. "Merge PDF"
  title: string;              // page H1
  description: string;        // one line
  category: ToolCategory;
  route: string;              // e.g. "/pdf/merge"
  keywords: string[];         // search synonyms
  acceptedFormats: string[];  // MIME types and extensions
  multiple: boolean;
  processingMode: 'browser';  // "server" added in v1.1
  limits: ToolLimits;
  options: OptionField[];     // drives the options panel
  primaryActionLabel: string;
  steps: string[];            // how-to
  faq: { q: string; a: string }[];
  related: string[];          // tool ids
  enabled: boolean;           // feature flag
  isTextTool?: boolean;       // whether tool uses the text-editor shell variant
  load: () => Promise<{ default: ToolProcessor }>; // lazy-load processor
}
