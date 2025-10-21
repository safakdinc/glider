import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { GliderConfig } from "@/types.js";

/**
 * Internal compiler configuration (resolved paths)
 */
export interface CompilerConfig extends GliderConfig {
  messagesDir: string;
  outputDir: string;
}

/**
 * Load configuration from glider.config.ts
 */
export async function loadConfig(overrides?: Partial<GliderConfig>): Promise<CompilerConfig> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "glider.config.ts");

  if (!fs.existsSync(configPath)) {
    console.error("glider.config.ts not found in project root!");
    console.log("Create a glider.config.ts file in your project root");
    process.exit(1);
  }

  try {
    const configModule = await import(pathToFileURL(configPath).href);
    const userConfig = configModule.default as GliderConfig;

    // Merge user config with CLI overrides and apply defaults
    const merged = {
      ...userConfig,
      ...overrides,
    };

    return {
      messagesDir: path.resolve(cwd, merged.messagesDir ?? "messages"),
      outputDir: path.resolve(cwd, merged.outputDir ?? "src/glider"),
      defaultLocale: merged.defaultLocale,
      locales: merged.locales,
      validateTranslations: merged.validateTranslations ?? true,
      generateNamespaces: merged.generateNamespaces ?? true,
    };
  } catch (error: any) {
    console.error("Failed to load glider.config.ts:", error.message);
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
