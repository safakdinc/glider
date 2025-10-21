import fs from "fs";
import path from "path";
import type { Message, LocaleFilesByPath } from "@/utils/types.js";
import { extractParameters } from "@/utils/helpers.js";

/**
 * Flatten nested JSON structure into key paths
 */
export function flattenMessages(obj: Record<string, any>, prefix: string = ""): Message[] {
  const messages: Message[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      messages.push({
        path: currentPath,
        value: value,
        params: [],
        isArray: true,
      });

      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          messages.push(...flattenMessages(item, `${currentPath}[${index}]`));
        } else {
          messages.push({
            path: `${currentPath}[${index}]`,
            value: item,
            params: extractParameters(item),
          });
        }
      });
    } else if (typeof value === "object" && value !== null) {
      messages.push(...flattenMessages(value, currentPath));
    } else {
      messages.push({
        path: currentPath,
        value: value,
        params: extractParameters(value),
      });
    }
  }

  return messages;
}

/**
 * Recursively find all locale files in a directory
 */
export function findLocaleFiles(dir: string, baseDir: string = dir): LocaleFilesByPath {
  const results: LocaleFilesByPath = {};
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const nested = findLocaleFiles(fullPath, baseDir);
      Object.assign(results, nested);
    } else if (file.endsWith(".json")) {
      const locale = path.basename(file, ".json");
      const relativePath = path.relative(baseDir, dir);

      if (!results[relativePath]) {
        results[relativePath] = {};
      }

      results[relativePath][locale] = fullPath;
    }
  }

  return results;
}
