import type { Message } from "@/utils/types.js";
import type { CompilerConfig } from "@/utils/config.js";

/**
 * Validate translations across all locales
 */
export function validateTranslations(
  config: CompilerConfig,
  localeData: Record<string, Message[]>,
  displayPath: string
): void {
  if (!config.validateTranslations) return;

  const messagesByPath: Record<string, Set<string>> = {};
  const loadedLocales = Object.keys(localeData);

  // Collect all message paths from all loaded locales
  Object.entries(localeData).forEach(([locale, msgs]) => {
    msgs.forEach((msg) => {
      if (!messagesByPath[msg.path]) {
        messagesByPath[msg.path] = new Set();
      }
      messagesByPath[msg.path].add(locale);
    });
  });

  // Check for missing translations
  const missingTranslations: Array<{ path: string; locale: string }> = [];
  const expectedLocales = new Set(config.locales);

  // First check: Are all configured locales present in the files?
  for (const expectedLocale of expectedLocales) {
    if (!loadedLocales.includes(expectedLocale)) {
      console.error(`\nERROR: Missing locale file "${expectedLocale}.json" in ${displayPath}`);
      console.error(`   Expected locales: ${config.locales.join(", ")}`);
      console.error(`   Found locales: ${loadedLocales.join(", ")}\n`);
      process.exit(1);
    }
  }

  // Second check: Do all messages exist in all locales?
  for (const [msgPath, availableLocales] of Object.entries(messagesByPath)) {
    for (const expectedLocale of expectedLocales) {
      if (!availableLocales.has(expectedLocale)) {
        missingTranslations.push({ path: msgPath, locale: expectedLocale });
      }
    }
  }

  if (missingTranslations.length > 0) {
    console.error(`\nERROR: Missing translations in ${displayPath}:\n`);

    // Group by locale for better readability
    const byLocale: Record<string, string[]> = {};
    missingTranslations.forEach(({ path, locale }) => {
      if (!byLocale[locale]) {
        byLocale[locale] = [];
      }
      byLocale[locale].push(path);
    });

    Object.entries(byLocale).forEach(([locale, paths]) => {
      console.error(`   Locale "${locale}" is missing ${paths.length} translation(s):`);
      paths.forEach((path) => {
        console.error(`      - ${path}`);
      });
      console.error("");
    });

    console.error("Add the missing translations to the corresponding JSON file\n");
    process.exit(1);
  }
}
