import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  test: {
    include: [
      "test/**/*.test.{ts,tsx}",
      "test/**/*.int.test.{ts,tsx}",
      "test/**/*.hook.test.{ts,tsx}",
      "test/**/*.ui.test.{ts,tsx}",
      "src/**/__tests__/**/*.test.{ts,tsx}",
      "src/**/__tests__/**/*.int.test.{ts,tsx}",
      "src/**/__tests__/**/*.hook.test.{ts,tsx}",
      "src/**/__tests__/**/*.ui.test.{ts,tsx}",
    ],
    exclude: ["node_modules/**", "dist/**", ".git/**"],
    environment: "node",
    globals: false,
    passWithNoTests: false,
    environmentMatchGlobs: [
      ["**/*.hook.test.tsx", "jsdom"],
      ["**/*.ui.test.tsx", "jsdom"],
      ["src/lib/**/__tests__/**/*.test.ts", "jsdom"],
    ],
    setupFiles: ["test/setup.ts", "./test/setupUnhandled.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
