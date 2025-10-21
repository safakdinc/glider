/**
 * Glider i18n Compiler
 *
 * i18n compiler that generates TypeScript functions from JSON translations.
 *
 * @packageDocumentation
 */

export type {
  GliderConfig,
  Locale,
  TranslationParams,
  TranslationFunction,
  TranslationFunctionWithParams,
  ArrayTranslationFunction,
} from "@/types.js";

export { default as compile } from "@/compiler.js";
