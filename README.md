# Glider i18n Compiler

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
npm install --save-dev glider tsx
```

or with yarn:

```bash
yarn add -D glider tsx
```

or with pnpm:

```bash
pnpm add -D glider tsx
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

Create a `glider.config.ts` file in your project root:

```typescript
import type { GliderConfig } from "glider";

const config: GliderConfig = {
  locales: ["en", "es"],
  defaultLocale: "en",
  // messagesDir: "messages", // default
  // outputDir: "src/glider", // default
  // validateTranslations: true, // default
  // generateNamespaces: true, // default
};

export default config;
```

**Configuration Options:**

- `locales` (required) - Array of supported locale codes
- `defaultLocale` (required) - Default locale for your application
- `messagesDir` (optional) - Directory containing translation JSON files (default: `"messages"`)
- `outputDir` (optional) - Output directory for compiled files (default: `"src/glider"`)
- `validateTranslations` (optional) - Check for missing translations (default: `true`)
- `generateNamespaces` (optional) - Generate namespace objects (default: `true`)

### 3. Compile translations

Run the compiler to generate TypeScript functions:

```bash
npx glider compile
```

or with yarn:

```bash
yarn glider compile
```

This generates the following structure:

```
src/glider/
├── _runtime.ts          # Runtime utilities (setLocale, getLocale)
├── _index.ts            # Re-exports all translations
└── translations/
    └── messages.ts      # Generated translation functions
```

## CLI Commands

### `glider compile`

Compile translations from JSON to TypeScript.

```bash
glider compile [options]
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
glider compile

# Override input/output directories
glider compile -i ./i18n -o ./src/translations

# Compile only specific locales
glider compile -l en,es,fr

# Skip validation
glider compile --no-validate
```

### `glider init`

Initialize a new Glider configuration file.

```bash
glider init [options]
```

**Options:**

- `-d, --dir <path>` - Directory to create config file in (default: current directory)

**Example:**

```bash
glider init
```

Creates a `glider.config.ts` file with default settings.

### `glider info`

Display current configuration.

```bash
glider info
```

Shows your current Glider configuration including locales, directories, and compiler options.

### `glider check`

Validate translations without compiling.

```bash
glider check [options]
```

**Options:**

- `-i, --input <path>` - Input directory containing translation JSON files (overrides config)

**Example:**

```bash
# Check translations with default config
glider check

# Check specific directory
glider check -i ./translations
```

This command validates that all translations are present for all configured locales without generating output files.

### `glider --help`

Display help for all commands.

```bash
glider --help
glider <command> --help
```

### `glider --version`

Display the version number.

```bash
glider --version
```

### 4. Use in your code

**With runtime locale (recommended):**

```typescript
import { setLocale, greeting, auth_login_title } from "./src/glider/_index";

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
import { greeting, auth_login_title } from "./src/glider/_index";

// Pass locale explicitly
console.log(greeting("en", { name: "Alice" }));
// Output: "Hello, Alice!"

console.log(auth_login_title("es"));
// Output: "Iniciar Sesión"
```

**Using namespace objects:**

```typescript
import { translations } from "./src/glider/translations/messages";

// Access translations via dot notation
console.log(translations.auth.login.title("en"));
// Output: "Sign In"

console.log(translations.greeting("es", { name: "Bob" }));
// Output: "¡Hola, Bob!"
```
