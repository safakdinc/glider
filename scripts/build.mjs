#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Building package...\n");

// Step 1: Run Vite build
console.log("Running Vite build...");
execSync("vite build", { stdio: "inherit", cwd: path.resolve(__dirname, "..") });

// Step 2: Generate TypeScript declarations
console.log("\nGenerating TypeScript declarations...");
execSync("tsc --emitDeclarationOnly --declaration --outDir dist", {
  stdio: "inherit",
  cwd: path.resolve(__dirname, ".."),
});

// Step 3: Add shebang to CLI file
console.log("\n✨ Adding shebang to CLI...");
const cliPath = path.resolve(__dirname, "../dist/cli.js");
const cliContent = fs.readFileSync(cliPath, "utf-8");

if (!cliContent.startsWith("#!/usr/bin/env node")) {
  fs.writeFileSync(cliPath, `#!/usr/bin/env node\n${cliContent}`);
}

// Step 4: Make CLI executable
console.log("Making CLI executable...");
fs.chmodSync(cliPath, "755");

console.log("\nBuild complete! Package ready in dist/\n");
