/**
 * Glider i18n Compiler - Type Definitions
 *
 * Import these types in your glider.config.ts:
 * import type { GliderConfig } from '@glider/compiler';
 */

/**
 * Configuration for the Glider i18n compiler
 */
export interface GliderConfig {
  /**
   * Supported locales in your application
   * These will be used for type generation and validation
   * @example ['en', 'es', 'fr', 'de']
   */
  locales: string[];

  /**
   * Default locale to fall back to when a translation is missing
   * @example 'en'
   */
  defaultLocale: string;

  /**
   * Directory containing translation JSON files
   * Relative to the project root
   * @example 'messages' or 'glider/translations'
   * @default 'messages'
   */
  messagesDir?: string;

  /**
   * Output directory for compiled translations
   * Relative to the project root
   * @example 'src/glider' or 'lib/glider'
   * @default 'src/glider'
   */
  outputDir?: string;

  /**
   * Whether to check for missing translations
   * If true, compiler will warn when translations are missing for any locale
   * @default true
   */
  validateTranslations?: boolean;

  /**
   * Whether to generate namespace objects alongside individual functions
   * Namespace objects provide better DX with dot notation access
   * @example dashboard.stats.cards('en') vs dashboard_stats_cards('en')
   * @default true
   */
  generateNamespaces?: boolean;
}

/**
 * Locale type - will be generated as a union of configured locales
 * @example type Locale = 'en' | 'es' | 'fr'
 */
export type Locale = string;

/**
 * Translation function parameters
 */
export type TranslationParams = Record<string, string | number>;

/**
 * Translation function signature (without parameters)
 */
export type TranslationFunction = (locale: Locale) => string | number | boolean;

/**
 * Translation function signature (with parameters)
 */
export type TranslationFunctionWithParams = (locale: Locale, params?: TranslationParams) => string;

/**
 * Array translation function signature
 */
export type ArrayTranslationFunction<T = any> = (locale: Locale, params?: TranslationParams) => T[];
