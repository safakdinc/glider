import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        compiler: resolve(__dirname, "src/compiler.ts"),
        cli: resolve(__dirname, "src/cli.ts"),
      },
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ["fs", "path", "url", "tsx", "commander"],
      output: {
        preserveModules: false,
        exports: "named",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "node18",
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
