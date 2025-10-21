import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { HotForkliftConfig } from "@/types.js";

/**
 * Internal compiler configuration (resolved paths)
 */
export interface CompilerConfig extends HotForkliftConfig {
  messagesDir: string;
  outputDir: string;
}

/**
 * Load configuration from hot-forklift.config.ts
 */
export async function loadConfig(overrides?: Partial<HotForkliftConfig>): Promise<CompilerConfig> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "hot-forklift.config.ts");

  if (!fs.existsSync(configPath)) {
    console.error("hot-forklift.config.ts not found in project root!");
    console.log("Create a hot-forklift.config.ts file in your project root");
    process.exit(1);
  }

  try {
    const configModule = await import(pathToFileURL(configPath).href);
    const userConfig = configModule.default as HotForkliftConfig;

    // Merge user config with CLI overrides and apply defaults
    const merged = {
      ...userConfig,
      ...overrides,
    };

    return {
      messagesDir: path.resolve(cwd, merged.messagesDir ?? "messages"),
      outputDir: path.resolve(cwd, merged.outputDir ?? "src/hot-forklift"),
      defaultLocale: merged.defaultLocale,
      locales: merged.locales,
      validateTranslations: merged.validateTranslations ?? true,
      generateNamespaces: merged.generateNamespaces ?? true,
    };
  } catch (error: any) {
    console.error("Failed to load hot-forklift.config.ts:", error.message);
    process.exit(1);
  }
}

/**
 * Generate locale type from config
 */
export function generateLocaleType(config: CompilerConfig): string {
  if (!config.locales || config.locales.length === 0) {
    return "string";
  }
  return config.locales.map((l) => `"${l}"`).join(" | ");
}
