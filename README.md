# Hot-Forklift i18n Compiler

**Personalized paraglide-js alternative**

> **Caution:** This library was created for my own specific use cases and development style. If you want something for complex projects, check [paraglide-js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) first.

> **Note:** This is not a complete paraglide-js alternative. It's a simpler, opinionated version tailored to specific workflows.

## Features

- **Tree-shakable** - Only bundle the translations you actually use
- **Type-safe** - Full TypeScript support with generated types
- **Namespace support** - Organize translations with dot notation
- **Validation** - Detect missing translations at compile time
- **Nested folders** - Mirror your app structure
- **SSR-friendly** - Resolve translations at build time for frameworks like Astro
- **Zero client overhead** - Ship only resolved strings, not translation functions

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

**Note:** When using nested folders (e.g., `messages/components/navbar/`), the compiler generates a separate `messages.ts` file for each folder with its own namespace object.

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
import { setLocale, greeting, auth_login_title } from "./src/hot-forklift/index";

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
import { greeting, auth_login_title } from "./src/hot-forklift/index";

// Pass locale explicitly
console.log(greeting("en", { name: "Alice" }));
// Output: "Hello, Alice!"

console.log(auth_login_title("es"));
// Output: "Iniciar Sesión"
```

**Using namespace objects:**

```typescript
import { translations } from "./src/hot-forklift/messages/messages";

// Access translations via dot notation
console.log(translations.auth.login.title("en"));
// Output: "Sign In"

console.log(translations.greeting("es", { name: "Bob" }));
// Output: "¡Hola, Bob!"
```

## SSR and Framework Integration

Hot Forklift provides utilities specifically designed for SSR frameworks like Astro, where you need to resolve translations at build time and pass them to client components.

Use the `resolveTranslations` utility to convert all translation functions to their string values at build time:

```typescript
import {
  type component_translations,
  type ResolvedTranslations,
  resolveTranslations,
} from "./src/hot-forklift";

// In your Astro component (SSR)
const resolvedtranslations = resolveTranslations(component_translations);
// resolvedtranslations now contains only strings, not functions

// Pass to React component
<Navbar translations={navTranslations} />
```

### Type Safety with `ResolvedTranslations`

The `ResolvedTranslations<T>` type automatically infers the correct structure:

```typescript
import type { component_translations } from "./hot-forklift";
import type { ResolvedTranslations } from "./hot-forklift";

// In your React component
interface ComponentProps {
  translations: ResolvedTranslations<typeof component_translations>;
}

export default function Navbar({ translations }: ComponentProps) {
  // translations.auth.login.title is now a string, not a function
  return <h1>{translations.auth.login.title}</h1>;
}
```

### Complete Astro + React Example

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
2. **Zero client bundle** - Only strings are shipped to the browser, not translation functions
3. **SSR-friendly** - All translations resolved at build time
4. **Serialization-safe** - No issues with function serialization across server/client boundary
5. **Performance** - No runtime translation overhead on the client

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
