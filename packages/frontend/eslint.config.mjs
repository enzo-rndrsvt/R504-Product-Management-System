import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

const sanitizeGlobals = (g) => Object.fromEntries(Object.entries(g).map(([k, v]) => [k.trim(), v]));

export default defineConfig([
  react.configs.flat.recommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      perfectionist,
      prettier: prettierPlugin
    },
    languageOptions: {
      globals: {
        ...sanitizeGlobals(globals.node),
        ...globals.jest,
        ...globals.browser
      }
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    }
  }
]);
