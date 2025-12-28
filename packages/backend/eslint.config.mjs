import globals from 'globals';
import n from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

// const sanitizeGlobals = (g) => Object.fromEntries(Object.entries(g).map(([k, v]) => [k.trim(), v]));

export default defineConfig([
  {
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
      globals: {
        ...globals.node,
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly'
      }
    }
  }
]);
