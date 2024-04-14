import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";
import typeScriptESLintParser from "@typescript-eslint/parser";

const compat = new FlatCompat();
const { recommended } = js.configs;

export default [
  {
    recommended,
    eslintConfigPrettier,
    ...compat.extends("plugin:@typescript-eslint/eslint-recommended"),
    parser: typeScriptESLintParser,
    ignores: ["**/node_modules/", "**/build/*", "**/testing/*"],
  },
];
