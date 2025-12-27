import globals, { jest } from 'globals';
import n from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

// const sanitizeGlobals = (g) => Object.fromEntries(Object.entries(g).map(([k, v]) => [k.trim(), v]));

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      n,
      unicorn,
      perfectionist,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }]
    },
    languageOptions: {
      // globals: { ...sanitizeGlobals(globals.node) }
      globals: { ...globals.node }
    }
  }
]);
