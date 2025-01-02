import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["node_modules/", "dist/"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/dist/", "**/node_modules/", "assets"],
    rules: {
      // prettier
      "no-unexpected-multiline": "error",
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^ignore",
          argsIgnorePattern: "^ignore",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/no-object-literal-type-assertion": "off",
      "class-methods-use-this": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      // v4 changes
      "no-restricted-syntax": "off",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": ["error"],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error"],
    },
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
