import globals from 'globals';
import n from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

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
      globals: {
        ...globals.node
      }
    }
  }
]);
