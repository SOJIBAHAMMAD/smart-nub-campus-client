import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test files:
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "e2e/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // The standard "fetch data inside useEffect" pattern used across the
      // client (resources, teams, discussions) triggers this v6 rule. The
      // setState calls happen after an await, so they are not truly
      // synchronous; disabling keeps lint consistent with existing modules.
      "react-hooks/set-state-in-effect": "off",
      // Allow underscore-prefixed unused variables/params (conventional for
      // intentionally unused values like destructured ignores).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
