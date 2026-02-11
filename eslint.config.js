import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    extends: [...tseslint.configs.recommended],
    rules: {
      indent: ["error", 2],
      "linebreak-style": ["error", "windows"],
      quotes: ["error", "single", { avoidEscape: true }],
      semi: ["error", "always"],
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
]);