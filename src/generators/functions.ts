import type { CompilerConfig } from "@/utils/config.js";
import type { ArrayItemInfo, MessageData } from "@/utils/types.js";
import { extractParameters, processArrayItem, generateFunctionName } from "@/utils/helpers.js";

/**
 * Generate runtime code for message interpolation
 */
export function generateMessageFunction(
  config: CompilerConfig,
  messagesPerLocale: Record<string, any>,
  params: string[],
  isArray: boolean = false,
  useRuntimeDefault: boolean = false
): string {
  const locales = Object.keys(messagesPerLocale);

  if (isArray) {
    const anyNeedsParams = locales.some((locale) => {
      const message = messagesPerLocale[locale];
      const arrayInfo = message.map(processArrayItem);
      return arrayInfo.some((info: ArrayItemInfo) => info.needsProcessing);
    });

    const langRef = useRuntimeDefault ? "_lang" : "lang";
    let code = "";
    if (useRuntimeDefault) {
      code += `const ${langRef} = (lang ?? getLocale());\n`;
    }
    code += "const translations = " + JSON.stringify(messagesPerLocale, null, 2) + ";\n";
    code += `  const items = translations[${langRef}] || translations["${config.defaultLocale}"];\n`;

    if (anyNeedsParams) {
      code += "  if (!params) return items;\n";
      code += "  return items.map(item => {\n";
      code += '    if (typeof item === "string") {\n';
      code += "      let result = item;\n";

      const allParams = new Set<string>();
      locales.forEach((locale) => {
        const message = messagesPerLocale[locale];
        message.forEach((item: any) => {
          if (typeof item === "string") {
            extractParameters(item).forEach((p) => allParams.add(p));
          }
        });
      });

      allParams.forEach((param) => {
        code += `      if (params.${param} !== undefined) result = result.replace(/{${param}}/g, String(params.${param}));\n`;
      });

      code += "      return result;\n";
      code += "    }\n";
      code += "    return item;\n";
      code += "  });";
    } else {
      code += "  return items;";
    }

    return code;
  }

  // For non-array messages
  const hasParams = params.length > 0;
  const langRef = useRuntimeDefault ? "_lang" : "lang";
  let code = "";

  if (useRuntimeDefault) {
    code += `const ${langRef} = (lang ?? getLocale());\n`;
  }
  code += "const translations = " + JSON.stringify(messagesPerLocale) + ";\n";
  code += `  let result = translations[${langRef}] || translations["${config.defaultLocale}"];\n`;

  if (hasParams) {
    code += "  if (!params) return result;\n";
    for (const param of params) {
      code += `  result = result.replace(/{${param}}/g, String(params.${param}));\n`;
    }
  }

  code += "  return result;";
  return code;
}

/**
 * Build a nested namespace object structure
 */
export function buildNamespaceObject(
  messagesByPath: Record<string, MessageData>,
  folderPrefix: string
): Record<string, any> {
  const namespace: Record<string, any> = {};

  for (const msgPath of Object.keys(messagesByPath)) {
    const parts = msgPath.replace(/\[(\d+)\]/g, "_$1").split(".");
    let current: Record<string, any> = namespace;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        current[part] = generateFunctionName(msgPath, folderPrefix);
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  return namespace;
}

/**
 * Generate code for namespace object
 */
export function generateNamespaceCode(obj: any, indent: number): string {
  const spaces = "  ".repeat(indent);
  const innerSpaces = "  ".repeat(indent + 1);

  if (typeof obj === "string") {
    return obj;
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return "{}";
  }

  let code = "{\n";

  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    const comma = isLast ? "" : ",";

    if (typeof value === "string") {
      code += `${innerSpaces}${key}: ${value}${comma}\n`;
    } else {
      code += `${innerSpaces}${key}: ${generateNamespaceCode(value, indent + 1)}${comma}\n`;
    }
  });

  code += `${spaces}}`;
  return code;
}
