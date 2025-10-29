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
 * Load configuration from hot-forklift.config.ts or hot-forklift.config.js
 */
export async function loadConfig(overrides?: Partial<HotForkliftConfig>): Promise<CompilerConfig> {
  const cwd = process.cwd();

  const configPaths = [
    path.join(cwd, "hot-forklift.config.ts"),
    path.join(cwd, "hot-forklift.config.js"),
    path.join(cwd, "hot-forklift.config.mjs"),
  ];

  let configPath: string | null = null;
  for (const p of configPaths) {
    if (fs.existsSync(p)) {
      configPath = p;
      break;
    }
  }

  if (!configPath) {
    console.error("hot-forklift config file not found in project root!");
    console.log(
      "Create one of: hot-forklift.config.ts, hot-forklift.config.js, or hot-forklift.config.mjs"
    );
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
    console.error(`Failed to load ${path.basename(configPath)}:`, error.message);
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
