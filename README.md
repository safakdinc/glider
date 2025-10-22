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
├── runtime.ts           # Runtime utilities (setLocale, getLocale)
├── index.ts             # Re-exports all translations
├── .gitignore           # Ignores generated files from git
├── .prettierignore      # Ignores generated files from formatting
└── messages/
    └── messages.ts      # Generated translation functions
```

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
