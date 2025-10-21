#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig } from "@/utils/config.js";
import { findLocaleFiles, flattenMessages } from "@/utils/parser.js";
import { validateTranslations } from "@/utils/validator.js";
import { generateFunctionName } from "@/utils/helpers.js";
import {
  generateCompiledOutput,
  generateIndexFile,
  generateRuntimeFile,
} from "@/generators/output.js";
import type { ExportInfo } from "@/utils/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main compiler function
 */
async function compile(overrides?: Partial<import("@/types.js").GliderConfig>) {
  console.log("Starting compilation...\n");

  const config = await loadConfig(overrides);
  console.log(`Config loaded: ${config.locales.join(", ")} (default: ${config.defaultLocale})\n`);

  const localeFilesByPath = findLocaleFiles(config.messagesDir);

  console.log(`Found ${Object.keys(localeFilesByPath).length} message paths:\n`);

  Object.keys(localeFilesByPath).forEach((p) => {
    const displayPath = p || "(root)";
    const locales = Object.keys(localeFilesByPath[p]);
    console.log(`    ${displayPath}: [${locales.join(", ")}]`);
  });

  console.log("");

  const allExports: ExportInfo[] = [];

  // Process each message path
  for (const [relativePath, localeFiles] of Object.entries(localeFilesByPath)) {
    const displayPath = relativePath || "(root)";
    console.log(`Processing ${displayPath}...`);

    const localeData: Record<string, any[]> = {};

    // Load all locales for this path
    for (const [locale, filePath] of Object.entries(localeFiles)) {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const messages = flattenMessages(content);
      localeData[locale] = messages;
      console.log(`   Loaded ${locale}: ${messages.length} messages`);
    }

    // Validate translations
    validateTranslations(config, localeData, displayPath);

    // Create output directory
    const isRoot = relativePath === "";
    const outputPath = isRoot
      ? path.join(config.outputDir, "messages")
      : path.join(config.outputDir, "messages", relativePath);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const folderPrefix = relativePath || "";

    // Generate compiled TypeScript output
    const output = generateCompiledOutput(config, localeData, folderPrefix);
    const outputFile = path.join(outputPath, "messages.ts");

    // Write runtime file once
    const runtimeFile = path.join(config.outputDir, "_runtime.ts");
    if (!fs.existsSync(runtimeFile)) {
      const runtimeContent = generateRuntimeFile(config);
      fs.writeFileSync(runtimeFile, runtimeContent);
    }

    // Compute relative import path for runtime
    const relToOutputRoot = path.relative(outputPath, config.outputDir) || ".";
    const runtimeImportPath =
      relToOutputRoot === "."
        ? "./_runtime.js"
        : path.posix.join(relToOutputRoot.replace(/\\\\/g, "/"), "_runtime.js");
    const importPrefix = `import { getLocale } from '${runtimeImportPath}';\n\n`;
    const finalOutput = importPrefix + output;
    fs.writeFileSync(outputFile, finalOutput);
    console.log(`   Generated ${path.relative(__dirname, outputFile)}\n`);

    // Collect exports for index
    const messagesByPath: Record<string, boolean> = {};
    Object.entries(localeData).forEach(([locale, msgs]) => {
      msgs.forEach((msg: any) => {
        if (!messagesByPath[msg.path]) {
          messagesByPath[msg.path] = true;
        }
      });
    });

    const exportFunctions = Object.keys(messagesByPath).map((msgPath) =>
      generateFunctionName(msgPath, folderPrefix)
    );

    const relativeImportPath = relativePath
      ? `./messages/${relativePath}/messages`
      : "./messages/messages";

    allExports.push({
      path: relativePath || "(root)",
      importPath: relativeImportPath,
      functions: exportFunctions,
    });
  }

  // Generate centralized index file
  console.log("Generating index file...");
  const indexContent = generateIndexFile(allExports);
  const indexFile = path.join(config.outputDir, "_index.ts");
  fs.writeFileSync(indexFile, indexContent);
  console.log(`Generated ${path.relative(process.cwd(), indexFile)}\n`);

  console.log("Compilation complete!\n");
}

// Export compile function for programmatic use
export default compile;

// Run compiler if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  compile().catch((error) => {
    console.error("❌ Compilation failed:", error);
    process.exit(1);
  });
}
