# Hot-Forklift i18n Compiler

**Personalized paraglide-js alternative**

> **Caution:** This library was created for my own specific use cases and development style. If you want something for complex projects, check [paraglide-js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) first.

> **Note:** This is not a complete paraglide-js alternative. It's a simpler, opinionated version tailored to specific workflows.

## Features

- **Tree-shakable** - Only bundle the translations you actually use
- **Type-safe** - Full TypeScript support with generated types
- **Parameter types** - Automatic TypeScript interface generation for translation parameters
- **Namespace support** - Organize translations with dot notation and nested structures
- **Array support** - Handle arrays of strings, objects, and nested structures
- **Validation** - Detect missing translations at compile time
- **Nested folders** - Mirror your app structure with automatic function naming
- **SSG-friendly** - Resolve translations at build time for frameworks like Astro
- **Zero client overhead** - Ship only resolved strings, not translation functions
- **Runtime locale** - Set locale once and use translations without passing it every time

## Installation

```bash
npm install --save-dev hot-forklift tsx
```

or with yarn:

```bash
yarn add -D hot-forklift tsx
```

or with pnpm:

```bash
pnpm add -D hot-forklift tsx
```

## Usage

### 1. Create your translation files

Create JSON files in a `messages` directory (or any directory you prefer):

**messages/en.json:**

```json
{
  "greeting": "Hello, {name}!",
  "auth": {
    "login": {
      "title": "Sign In",
      "button": "Login"
    }
  }
}
```

**messages/es.json:**

```json
{
  "greeting": "¡Hola, {name}!",
  "auth": {
    "login": {
      "title": "Iniciar Sesión",
      "button": "Iniciar Sesión"
    }
  }
}
```

Hot Forklift supports nested objects, arrays, and mixed types. It will generate appropriate TypeScript functions for each structure.

### 2. Create configuration file

Create a `hot-forklift.config.ts` file in your project root:

```typescript
import type { HotForkliftConfig } from "hot-forklift";

const config: HotForkliftConfig = {
  locales: ["en", "es"],
  defaultLocale: "en",
  // messagesDir: "messages", // default
  // outputDir: "src/hot-forklift", // default
  // validateTranslations: true, // default
  // generateNamespaces: true, // default
};

export default config;
```

**Configuration Options:**

- `locales` (required) - Array of supported locale codes
- `defaultLocale` (required) - Default locale for your application
- `messagesDir` (optional) - Directory containing translation JSON files (default: `"messages"`)
- `outputDir` (optional) - Output directory for compiled files (default: `"src/hot-forklift"`)
- `validateTranslations` (optional) - Check for missing translations (default: `true`)
- `generateNamespaces` (optional) - Generate namespace objects (default: `true`)

### 3. Compile translations

Run the compiler to generate TypeScript functions:

```bash
npx hot-forklift compile
```

or with yarn:

```bash
yarn hot-forklift compile
```

This generates the following structure:

```
src/hot-forklift/
├── runtime.ts           # Runtime utilities (setLocale, getLocale, resolveTranslations)
├── index.ts             # Re-exports all translations
├── .gitignore           # Ignores generated files from git
├── .prettierignore      # Ignores generated files from formatting
└── messages/
    └── messages.ts      # Generated translation functions
```

**Important notes:**

- When using nested folders (e.g., `messages/components/navbar/`), the compiler generates a separate `messages.ts` file for each folder with its own namespace object.
- Folder names with hyphens (e.g., `message-folder`) are automatically converted to underscores in function names (e.g., `message_folder_functionName`) to ensure valid JavaScript identifiers.
- The generated files are automatically added to `.gitignore` and `.prettierignore` in the output directory.

## CLI Commands

### `hot-forklift compile`

Compile translations from JSON to TypeScript.

```bash
hot-forklift compile [options]
```

**Options:**

- `-i, --input <path>` - Input directory containing translation JSON files (overrides config)
- `-o, --output <path>` - Output directory for compiled TypeScript files (overrides config)
- `-l, --locales <locales>` - Comma-separated list of locales (overrides config)
- `--no-validate` - Skip translation validation
- `--no-namespaces` - Don't generate namespace objects

**Examples:**

```bash
# Compile with default config
hot-forklift compile

# Override input/output directories
hot-forklift compile -i ./i18n -o ./src/translations

# Compile only specific locales
hot-forklift compile -l en,es,fr

# Skip validation
hot-forklift compile --no-validate
```

### `hot-forklift init`

Initialize a new Hot Forklift configuration file.

```bash
hot-forklift init [options]
```

**Options:**

- `-d, --dir <path>` - Directory to create config file in (default: current directory)

**Example:**

```bash
hot-forklift init
```

Creates a `hot-forklift.config.ts` file with default settings.

### `hot-forklift info`

Display current configuration.

```bash
hot-forklift info
```

Shows your current Hot Forklift configuration including locales, directories, and compiler options.

### `hot-forklift check`

Validate translations without compiling.

```bash
hot-forklift check [options]
```

**Options:**

- `-i, --input <path>` - Input directory containing translation JSON files (overrides config)

**Example:**

```bash
# Check translations with default config
hot-forklift check

# Check specific directory
hot-forklift check -i ./translations
```

This command validates that all translations are present for all configured locales without generating output files.

### `hot-forklift --help`

Display help for all commands.

```bash
hot-forklift --help
hot-forklift <command> --help
```

### `hot-forklift --version`

Display the version number.

```bash
hot-forklift --version
```

### 4. Use in your code

**With runtime locale (recommended):**

```typescript
import { setLocale, greeting, auth_login_title } from "./src/hot-forklift";

// Set the global locale once
setLocale("es");

// Use translations without passing locale parameter
console.log(greeting({ name: "Alice" }));
// Output: "¡Hola, Alice!"

console.log(auth_login_title());
// Output: "Iniciar Sesión"
```

**With explicit locale parameter:**

```typescript
import { greeting, auth_login_title } from "./src/hot-forklift";

// Pass locale in the options object
console.log(greeting({ lang: "en", name: "Alice" }));
// Output: "Hello, Alice!"

console.log(auth_login_title({ lang: "es" }));
// Output: "Iniciar Sesión"
```

**Using namespace objects:**

```typescript
import { translations } from "./src/hot-forklift";

// Access translations via dot notation
console.log(translations.auth.login.title({ lang: "en" }));
// Output: "Sign In"

console.log(translations.greeting({ lang: "es", name: "Bob" }));
// Output: "¡Hola, Bob!"

// Arrays are also supported
console.log(translations.features({ lang: "en" }));
// Output: ["Tree-shakable", "Type-safe", "SSR-friendly"]
```

## Working with Arrays

Hot Forklift provides full support for arrays in your translations, including arrays of strings, objects, and nested structures.

### Simple Arrays

**messages/en.json:**

```json
{
  "navigation": {
    "main": ["Home", "About", "Contact"]
  }
}
```

```typescript
import { navigation_main } from "./hot-forklift";

const navItems = navigation_main(); // ["Home", "About", "Contact"]
```

### Arrays of Objects

**messages/en.json:**

```json
{
  "features": [
    {
      "title": "Fast",
      "description": "Lightning fast performance"
    },
    {
      "title": "Secure",
      "description": "Enterprise-grade security"
    }
  ]
}
```

```typescript
import { features, setLocale, resolveTranslations } from "./hot-forklift";

setLocale("en");

// Access individual items via namespace
console.log(features()[0].title); // "Fast"
console.log(features()[1].description); // "Enterprise-grade security"
```

### Nested Arrays

You can also have arrays as properties within objects, or objects within arrays. Hot Forklift handles these complex structures automatically and generates type-safe functions for each level.

## SSR and Framework Integration

Hot Forklift provides utilities specifically designed for SSR frameworks like Astro, where you need to resolve translations at build time and pass them to client components.
Use the `resolveTranslations` utility to convert translation functions to their string values at build time:

```typescript
import {
  type component_translations,
  type ResolvedTranslations,
  resolveTranslations,
} from "./src/hot-forklift";

// In your Astro component (SSR)
const resolvedtranslations = resolveTranslations(component_translations);
// All translation functions become strings

// Pass to React component
<Navbar translations={navTranslations} />
```

**Best practices:**

- Use `resolveTranslations` only for translations **without parameters**
- For parameterized translations (e.g., `greeting({ name: "User" })`), call the functions directly in your components
- Keep parameterized and parameter-free translations separate if you plan to use `resolveTranslations`

### Type Safety with `ResolvedTranslations`

The `ResolvedTranslations<T>` type transforms function types to their return types, ensuring the resolved object matches runtime behavior:

```typescript
import type { component_translations } from "./hot-forklift";
import type { ResolvedTranslations } from "./hot-forklift";

// In your React component
interface ComponentProps {
  translations: ResolvedTranslations<typeof component_translations>;
}

export default function Navbar({ translations }: ComponentProps) {
  // All translation functions are resolved to strings
  const title = translations.auth.login.title; // string type
  const company = translations.nav.company; // string type

  return (
    <div>
      <h1>{title}</h1>
      <p>{company}</p>
    </div>
  );
}
```

**Key points:**

- The `ResolvedTranslations<T>` type converts function types to their return types
- This ensures TypeScript types match the runtime behavior after resolution
- All functions are resolved to strings (or their return values)
- Do not use `resolveTranslations` if your translations have parameter interpolation

**messages/components/navbar/en.json:**

```json
{
  "nav": {
    "solutions": "Solutions",
    "company": "Company",
    "pricing": "Pricing"
  }
}
```

**layout.astro:**

```astro
---
import { resolveTranslations, component_translations } from "@/hot-forklift";
import { setLocale } from "@/hot-forklift/runtime";
import Component from "@/components/component";

const lang = Astro.params.lang || "en";
setLocale(lang);

// Resolve all translation functions to strings
const resolvedTranslations = resolveTranslations(component_translations);
---

<html>
  <body>
    <Component client:load translations={resolvedTranslations} />
  </body>
</html>
```

**components/navbar.tsx:**

```tsx
import type { component_translations, ResolvedTranslations } from "@/hot-forklift";

interface NavbarProps {
  translations: ResolvedTranslations<typeof component_translations>;
}

export default function Navbar({ translations }: NavbarProps) {
  return (
    <nav>
      <a href="/solutions">{translations.nav.solutions}</a>
      <a href="/company">{translations.nav.company}</a>
      <a href="/pricing">{translations.nav.pricing}</a>
    </nav>
  );
}
```

### Benefits of This Approach

1. **Type-safe** - Full autocomplete and type checking
2. **Build-time resolution** - All translations resolved to strings at build time
3. **Zero overhead** - No translation functions shipped to the client
4. **SSG-friendly** - Perfect for static site generation
5. **Serialization-safe** - Only strings are passed to client components
6. **Performance** - Minimal runtime overhead on the client

### Nested Folders and Namespace Imports

When using nested folder structures, import namespaces from `@/hot-forklift`

```typescript
// Import specific namespace from nested folder
import { component_translations_company } from "@/hot-forklift";

// Resolve it separately
const companyTranslations = resolveTranslations(component_translations_company);

// Use with type inference
interface Props {
  companyTranslations: ResolvedTranslations<typeof component_translations_company>;
}
```

This allows you to:

- Split translations into logical sections
- Reduce bundle size by only importing what you need
- Maintain clear separation of concerns

### Folder Naming Conventions

Hot Forklift automatically handles folder names with hyphens and special characters:

**Directory structure:**

```
messages/
  client-side-security/
    en.json
    es.json
```

**Generated function names:**

```typescript
// Hyphens are converted to underscores
import { client_side_security_title } from "./hot-forklift";

// Namespace also uses underscores
import { client_side_security } from "./hot-forklift/messages/client-side-security/messages";
```

This ensures all generated identifiers are valid JavaScript variable names while preserving your folder structure.

## Advanced Features

### Parameter Interpolation

Support for dynamic values in translations with full TypeScript type safety:

**messages/en.json:**

```json
{
  "welcome": "Welcome, {name}! You have {count} messages."
}
```

**Generated TypeScript:**

```typescript
export interface WelcomeParams {
  name: string | number;
  count: string | number;
}

export function welcome(options: { lang?: Locale } & WelcomeParams): string;
```

**Usage:**

```typescript
import { welcome } from "./hot-forklift";

// TypeScript provides autocomplete and type checking for parameters
console.log(welcome({ name: "Alice", count: 5 }));
// Output: "Welcome, Alice! You have 5 messages."

// All parameters are in a single options object
console.log(welcome({ lang: "es", name: "Alice", count: 5 }));
// Output: "¡Bienvenida, Alice! Tienes 5 mensajes."

// TypeScript will show an error if you don't provide required parameters
// welcome({}); // Error: Property 'name' is missing
// welcome({ name: "Bob" }); // Error: Property 'count' is missing

// TypeScript will show an error if you use wrong parameter names
// welcome({ wrongParam: "test" }); // Error: Property 'wrongParam' does not exist

// Numbers work too
welcome({ name: "Bob", count: 42 });
```

The compiler automatically generates TypeScript interfaces for each translation function that uses parameters. This provides:

- **Type safety** - Compile-time errors for missing or incorrect parameters
- **Single object API** - No need to pass locale separately when you have parameters
- **Required parameters** - TypeScript enforces that you provide all required parameters
- **Refactoring** - Safe renaming across your codebase

### Mixed Types

Hot Forklift automatically detects and generates correct TypeScript types for your translations:

```json
{
  "isActive": true,
  "count": 42,
  "message": "Hello"
}
```

The generated functions will have return types of `boolean`, `number`, and `string` respectively.

### Debug Information

All generated functions include metadata for debugging:

```typescript
import { greeting } from "./hot-forklift";

console.log(greeting._translations);
// Output: { en: "Hello, {name}!", es: "¡Hola, {name}!" }
```
