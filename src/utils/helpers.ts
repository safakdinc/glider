import type { ArrayItemInfo } from "@/utils/types.js";

/**
 * Parse a message string and extract parameters
 */
export function extractParameters(message: any): string[] {
  if (typeof message !== "string") return [];
  const regex = /\{(\w+)\}/g;
  const params = new Set<string>();
  let match;
  while ((match = regex.exec(message)) !== null) {
    params.add(match[1]);
  }
  return Array.from(params);
}

/**
 * Process array items for parameter interpolation
 */
export function processArrayItem(item: any): ArrayItemInfo {
  if (typeof item === "string") {
    const params = extractParameters(item);
    if (params.length > 0) {
      return { needsProcessing: true, params, value: item };
    }
    return { needsProcessing: false, value: item };
  }

  if (typeof item === "object" && item !== null) {
    const stringified = JSON.stringify(item);
    if (stringified.includes("{") && stringified.includes("}")) {
      return { needsProcessing: true, value: item };
    }
  }

  return { needsProcessing: false, value: item };
}

/**
 * Generate a safe function name from a key path
 */
export function generateFunctionName(keyPath: string, folderPrefix: string = ""): string {
  const baseName = keyPath.replace(/\./g, "_").replace(/\[(\d+)\]/g, "_$1");
  if (folderPrefix) {
    const prefix = folderPrefix.replace(/\//g, "_").replace(/-/g, "_") + "_";
    return prefix + baseName;
  }
  return baseName;
}

/**
 * Generate TypeScript type name from a key path
 */
export function generateParamsTypeName(keyPath: string, folderPrefix: string = ""): string {
  const functionName = generateFunctionName(keyPath, folderPrefix);
  // Capitalize first letter and add Params suffix
  return functionName.charAt(0).toUpperCase() + functionName.slice(1) + "Params";
}

/**
 * Generate TypeScript interface for parameters
 */
export function generateParamsInterface(typeName: string, params: string[]): string {
  if (params.length === 0) {
    return "";
  }

  const properties = params.map((param) => `  ${param}: string | number;`).join("\n");
  return `export interface ${typeName} {\n${properties}\n}\n`;
}
