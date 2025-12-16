import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules", ".next", "dist", "out"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
