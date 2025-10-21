/**
 * Message metadata
 */
export interface Message {
  path: string;
  value: any;
  params: string[];
  isArray?: boolean;
}

/**
 * Message data grouped by path
 */
export interface MessageData {
  params: string[];
  isArray?: boolean;
  values: Record<string, any>;
}

/**
 * Array item processing result
 */
export interface ArrayItemInfo {
  needsProcessing: boolean;
  params?: string[];
  value: any;
}

/**
 * Export information for index file generation
 */
export interface ExportInfo {
  path: string;
  importPath: string;
  functions: string[];
}

/**
 * Locale files organized by path
 */
export type LocaleFilesByPath = Record<string, Record<string, string>>;
