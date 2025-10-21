#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
let version = "1.0.0";
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));
  version = packageJson.version;
} catch (e) {
  // Ignore if package.json not found
}

const program = new Command();

program
  .name("hot-forklift")
  .description("Hot Forklift i18n Compiler - Generate TypeScript functions from JSON translations")
  .version(version);

// Compile command
program
  .command("compile")
  .description("Compile translations from JSON to TypeScript")
  .option(
    "-i, --input <path>",
    "Input directory containing translation JSON files (overrides config)"
  )
  .option(
    "-o, --output <path>",
    "Output directory for compiled TypeScript files (overrides config)"
  )
  .option(
    "-l, --locales <locales>",
    "Comma-separated list of locales (overrides config)",
    (value) => value.split(",").map((l) => l.trim())
  )
  .option("--no-validate", "Skip translation validation")
  .option("--no-namespaces", "Don't generate namespace objects")
  .action(async (options) => {
    const { default: compile } = await import("@/compiler.js");

    //Pass CLI options to override config
    const overrides: Partial<import("@/types.js").HotForkliftConfig> = {};
    if (options.input) overrides.messagesDir = options.input;
    if (options.output) overrides.outputDir = options.output;
    if (options.locales) overrides.locales = options.locales;
    if (options.validate !== undefined) overrides.validateTranslations = options.validate;
    if (options.namespaces !== undefined) overrides.generateNamespaces = options.namespaces;

    await compile(overrides);
  });

// Init command
program
  .command("init")
  .description("Initialize a new Glider configuration file")
  .option("-d, --dir <path>", "Directory to create config file in", ".")
  .action(async (options) => {
    const { writeFileSync, existsSync } = await import("fs");
    const { resolve } = await import("path");

    const configPath = resolve(options.dir, "glider.config.ts");

    if (existsSync(configPath)) {
      console.error(`Error: Config file already exists at ${configPath}`);
      process.exit(1);
    }

    const configTemplate = `import type { HotForkliftConfig } from 'hot-forklift';

const config: HotForkliftConfig = {
  locales: ['en'],
  defaultLocale: 'en',
  // messagesDir: 'messages', // default
  // outputDir: 'src/hot-forklift', // default
};

export default config;
`;

    writeFileSync(configPath, configTemplate, "utf-8");
    console.log(`Created config file at ${configPath}`);
    console.log("\nNext steps:");
    console.log("  1. Update the config with your locales and paths");
    console.log("  2. Create your messages directory with JSON files");
    console.log("  3. Run 'hot-forklift compile' to generate TypeScript functions");
  });

// Info command
program
  .command("info")
  .description("Display current configuration")
  .action(async () => {
    const { loadConfig } = await import("@/utils/config.js");

    try {
      const config = await loadConfig();

      console.log("\nCurrent Configuration:\n");
      console.log(`  Locales:               ${config.locales.join(", ")}`);
      console.log(`  Default Locale:        ${config.defaultLocale}`);
      console.log(`  Messages Directory:    ${config.messagesDir}`);
      console.log(`  Output Directory:      ${config.outputDir}`);
      console.log(`  Validate Translations: ${config.validateTranslations ? "yes" : "no"}`);
      console.log(`  Generate Namespaces:   ${config.generateNamespaces ? "yes" : "no"}`);
      console.log("");
    } catch (error) {
      console.error("Failed to load configuration:");
      console.error((error as Error).message);
      process.exit(1);
    }
  });

// Check command
program
  .command("check")
  .description("Validate translations without compiling")
  .option(
    "-i, --input <path>",
    "Input directory containing translation JSON files (overrides config)"
  )
  .action(async (options) => {
    const { loadConfig } = await import("@/utils/config.js");
    const { findLocaleFiles, flattenMessages } = await import("@/utils/parser.js");
    const { validateTranslations } = await import("@/utils/validator.js");
    const { readFileSync } = await import("fs");

    try {
      const config = await loadConfig(options.input ? { messagesDir: options.input } : undefined);

      console.log("Checking translations...\n");

      const localeFilesByPath = findLocaleFiles(config.messagesDir);

      // Process each message path
      for (const [relativePath, localeFiles] of Object.entries(localeFilesByPath)) {
        const displayPath = relativePath || "(root)";
        const localeData: Record<string, any[]> = {};

        // Load all locales for this path
        for (const [locale, filePath] of Object.entries(localeFiles)) {
          const content = JSON.parse(readFileSync(filePath, "utf-8"));
          const messages = flattenMessages(content);
          localeData[locale] = messages;
        }

        validateTranslations(config, localeData, displayPath);
      }

      console.log("All translations are valid!\n");
    } catch (error) {
      console.error("Validation failed:");
      console.error((error as Error).message);
      process.exit(1);
    }
  });

program.parse();

export {};
