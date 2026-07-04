import js from "@eslint/js";
export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        navigator: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        Promise: "readonly"
      }
    },
    rules: {
      "no-undef": "error"
    }
  }
];
