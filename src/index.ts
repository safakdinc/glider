/**
 * Hot Forklift i18n Compiler
 *
 * i18n compiler that generates TypeScript functions from JSON translations.
 *
 * @packageDocumentation
 */

export type {
  HotForkliftConfig,
  Locale,
  TranslationParams,
  TranslationFunction,
  TranslationFunctionWithParams,
  ArrayTranslationFunction,
} from "@/types.js";

export { default as compile } from "@/compiler.js";
