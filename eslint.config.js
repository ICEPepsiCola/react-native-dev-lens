import stylistic from '@stylistic/eslint-plugin'
import tseslint from  'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ['dist', 'node_modules', 'src-tauri/target', '*.config.js', '*.config.ts', 'packages/*/dist', 'example/**'],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      'unicorn': unicorn,
    },
    rules: {
      // File naming convention
      'unicorn/filename-case': ['error', {
        case: 'kebabCase',
        ignore: ['^vite-env\\.d\\.ts$'],
      }],
      // Stylistic rules
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/max-len': ['warn', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true }],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  }
)
