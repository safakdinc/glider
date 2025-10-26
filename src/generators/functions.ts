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
  useOptionsObject: boolean = false
): string {
  const locales = Object.keys(messagesPerLocale);

  if (isArray) {
    const anyNeedsParams = locales.some((locale) => {
      const message = messagesPerLocale[locale];
      const arrayInfo = message.map(processArrayItem);
      return arrayInfo.some((info: ArrayItemInfo) => info.needsProcessing);
    });

    let code = "";
    if (useOptionsObject) {
      code += `const _lang = (options?.lang ?? getLocale());\n`;
    } else {
      code += `const _lang = lang ?? getLocale();\n`;
    }
    code += "const translations = " + JSON.stringify(messagesPerLocale, null, 2) + ";\n";
    code += `  const items = translations[_lang] || translations["${config.defaultLocale}"];\n`;

    if (anyNeedsParams) {
      if (useOptionsObject) {
        code += "  if (!options) return items;\n";
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
          code += `      if (options.${param} !== undefined) result = result.replace(/{${param}}/g, String(options.${param}));\n`;
        });

        code += "      return result;\n";
        code += "    }\n";
        code += "    return item;\n";
        code += "  });";
      } else {
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
      }
    } else {
      code += "  return items;";
    }

    return code;
  }

  // For non-array messages
  const hasParams = params.length > 0;
  let code = "";

  if (useOptionsObject) {
    code += `const _lang = (options?.lang ?? getLocale());\n`;
  } else {
    code += `const _lang = (lang ?? getLocale());\n`;
  }
  code += "const translations = " + JSON.stringify(messagesPerLocale) + ";\n";
  code += `  let result = translations[_lang] || translations["${config.defaultLocale}"];\n`;

  if (hasParams) {
    for (const param of params) {
      code += `  result = result.replace(/{${param}}/g, String(options.${param}));\n`;
    }
  }

  code += "  return result;";
  return code;
}

/**
 * Build a nested namespace object structure with metadata
 */
export function buildNamespaceObject(
  messagesByPath: Record<string, MessageData>,
  folderPrefix: string
): Record<string, any> {
  const namespace: Record<string, any> = {};

  // First pass: identify array parent paths
  const arrayPaths = new Set<string>();
  for (const [msgPath, messageData] of Object.entries(messagesByPath)) {
    if (messageData.isArray) {
      arrayPaths.add(msgPath);
    }
  }

  for (const [msgPath, messageData] of Object.entries(messagesByPath)) {
    const parts = msgPath.replace(/\[(\d+)\]/g, "_$1").split(".");
    let current: Record<string, any> = namespace;

    // Check if this is an array item (has _0, _1, etc pattern)
    const arrayItemMatch = msgPath.match(/^(.+)_(\d+)(?:\.(.+))?$/);
    if (arrayItemMatch) {
      const [, arrayBasePath, indexStr] = arrayItemMatch;
      const index = parseInt(indexStr, 10);

      // Check if the base path is an array
      if (arrayPaths.has(arrayBasePath)) {
        // This is an array item, skip it - we'll handle it in the array construction
        continue;
      }
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        // Check if this is an array
        if (messageData.isArray) {
          // Build array from individual item functions
          const arrayLength = Array.isArray(Object.values(messageData.values)[0])
            ? Object.values(messageData.values)[0].length
            : 0;

          const arrayItems: any[] = [];
          for (let idx = 0; idx < arrayLength; idx++) {
            const itemPath = `${msgPath}_${idx}`;
            const itemFunctionName = generateFunctionName(itemPath, folderPrefix);

            // Check if this item has nested properties (is an object)
            const itemValue = Object.values(messageData.values)[0][idx];
            if (typeof itemValue === "object" && itemValue !== null && !Array.isArray(itemValue)) {
              // Build nested object for this array item
              const itemObj: Record<string, any> = {};
              for (const key of Object.keys(itemValue)) {
                const nestedPath = `${itemPath}_${key}`;
                itemObj[key] = {
                  functionName: generateFunctionName(nestedPath, folderPrefix),
                  translations: Object.fromEntries(
                    Object.entries(messageData.values).map(([locale, arr]: [string, any]) => [
                      locale,
                      arr[idx][key],
                    ])
                  ),
                  isArray: false,
                };
              }
              arrayItems.push(itemObj);
            } else {
              // Simple value, just reference the function
              arrayItems.push({
                functionName: itemFunctionName,
                translations: Object.fromEntries(
                  Object.entries(messageData.values).map(([locale, arr]: [string, any]) => [
                    locale,
                    arr[idx],
                  ])
                ),
                isArray: false,
              });
            }
          }

          current[part] = {
            isArrayNamespace: true,
            items: arrayItems,
            translations: messageData.values,
          };
        } else {
          current[part] = {
            functionName: generateFunctionName(msgPath, folderPrefix),
            translations: messageData.values,
            isArray: messageData.isArray,
          };
        }
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
 * Generate code for namespace object with JSDoc comments
 */
export function generateNamespaceCode(obj: any, indent: number): string {
  const spaces = "  ".repeat(indent);
  const innerSpaces = "  ".repeat(indent + 1);

  // Handle function metadata objects
  if (obj && typeof obj === "object" && obj.functionName && obj.translations) {
    return obj.functionName;
  }

  // Handle array namespace
  if (obj && typeof obj === "object" && obj.isArrayNamespace && obj.items) {
    const arrayItems = obj.items.map((item: any) => {
      if (item && typeof item === "object" && !item.functionName) {
        // This is an object item with nested properties
        return generateNamespaceCode(item, indent + 1);
      }
      // This is a simple function reference
      return generateNamespaceCode(item, indent);
    });

    return `[\n${innerSpaces}${arrayItems.join(`,\n${innerSpaces}`)}\n${spaces}]`;
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return "{}";
  }

  let code = "{\n";

  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    const comma = isLast ? "" : ",";

    // Handle array namespace
    if (value && typeof value === "object" && "isArrayNamespace" in value) {
      const valueObj = value as {
        isArrayNamespace: boolean;
        items: any[];
        translations: Record<string, any>;
      };

      // Add JSDoc comment with array translation examples
      code += `${innerSpaces}/**\n`;
      Object.entries(valueObj.translations).forEach(([locale, translation]) => {
        code += `${innerSpaces} * @${locale} ${JSON.stringify(translation)}\n`;
      });
      code += `${innerSpaces} */\n`;
      code += `${innerSpaces}${key}: ${generateNamespaceCode(value, indent + 1)}${comma}\n`;
    }
    // Generate JSDoc comment for this property if it has translation data
    else if (
      value &&
      typeof value === "object" &&
      "functionName" in value &&
      "translations" in value
    ) {
      const valueObj = value as {
        functionName: string;
        translations: Record<string, any>;
        isArray?: boolean;
      };

      // Add JSDoc comment with translation examples
      code += `${innerSpaces}/**\n`;
      Object.entries(valueObj.translations).forEach(([locale, translation]) => {
        if (valueObj.isArray) {
          code += `${innerSpaces} * @${locale} ${JSON.stringify(translation)}\n`;
        } else {
          code += `${innerSpaces} * @${locale} "${translation}"\n`;
        }
      });
      code += `${innerSpaces} */\n`;
      code += `${innerSpaces}${key}: ${valueObj.functionName}${comma}\n`;
    } else if (
      value &&
      typeof value === "object" &&
      !("functionName" in value) &&
      !("isArrayNamespace" in value)
    ) {
      // This is a nested namespace object
      code += `${innerSpaces}${key}: ${generateNamespaceCode(value, indent + 1)}${comma}\n`;
    } else if (typeof value === "string") {
      // Legacy handling for backward compatibility
      code += `${innerSpaces}${key}: ${value}${comma}\n`;
    }
  });

  code += `${spaces}}`;
  return code;
}
