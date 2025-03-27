import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";

export default [
  { ignores: ["dist"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "import": importPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Your rules from JSON config
      "no-var": "error",
      "prefer-const": ["error"],
      "quotes": ["error", "double"],
      "semi": "error",
      "indent": ["error", 2, {
        "SwitchCase": 1
      }],
      "eol-last": "error",
      "no-multiple-empty-lines": ["error", {
        "max": 1
      }],
      "max-len": ["warn", 160],
      "camelcase": ["error", {
        "ignoreDestructuring": true,
        "ignoreImports": true,
        "allow": ["^Global_*", "^z_*"]
      }],
      "new-cap": "error",
      "id-length": ["error", {
        "min": 1,
        "exceptions": ["_"]
      }],
      "no-console": ["error", {
        "allow": ["debug", "error", "clear"]
      }],
      "no-const-assign": "error",
      "import/first": "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }], // Merged with existing rule
      "comma-spacing": ["error", {
        "before": false,
        "after": true
      }],
      "no-multi-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "object-curly-newline": ["error", {
        "ObjectExpression": { "multiline": true, "minProperties": 3 },
        "ObjectPattern": { "multiline": true, "minProperties": 3 },
        "ImportDeclaration": { "multiline": true, "minProperties": 3 },
        "ExportDeclaration": { "multiline": true, "minProperties": 3 }
      }],
      "object-property-newline": ["error", {
        "allowMultiplePropertiesPerLine": true
      }],
      "array-bracket-spacing": ["error", "never", { "objectsInArrays": false }],
      "space-in-parens": ["error", "never"],
      "brace-style": "error",
      "implicit-arrow-linebreak": ["error", "beside"],
      "keyword-spacing": ["error", {
        "before": true,
        "after": true
      }],

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]
