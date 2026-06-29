import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/.gitignore'],
    files: ['**/*.ts'],
  },
  ...compat.extends('plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
    },

    rules: {
      '@typescript-eslint/explicit-member-accessibility': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/no-parameter-properties': 0,
      '@typescript-eslint/interface-name-prefix': 0,
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/indent': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // SonarQube parity rules (non-type-aware) - warn for incremental fixing
      'no-lonely-if': 'warn',                             // S6660: if as only stmt in else
      '@typescript-eslint/no-empty-function': 'warn',    // S1186: empty methods
      '@typescript-eslint/prefer-optional-chain': 'warn', // S6582: optional chaining
      'no-negated-condition': 'warn',                    // S7735: negated conditions
      'no-empty': ['warn', { allowEmptyCatch: true }],   // S108: empty block
      'no-restricted-globals': [                         // S7773: Number.parseFloat/parseInt
        'warn',
        { name: 'parseFloat', message: 'Use Number.parseFloat instead.' },
        { name: 'parseInt', message: 'Use Number.parseInt instead.' },
      ],
      'default-param-last': 'warn',                      // S1788: default params last
      '@typescript-eslint/prefer-for-of': 'warn',        // S4138: for-of over indexed for
      '@typescript-eslint/no-this-alias': 'warn',        // S7740: no this alias (that = this)
      'no-self-assign': 'warn',                          // S1656: self-assignment
      'no-useless-return': 'warn',                       // S3626: redundant return/jump
      'no-duplicate-imports': 'warn',                    // S3863: duplicate imports
      'no-nested-ternary': 'warn',                       // S3358: nested ternary
      '@typescript-eslint/no-useless-constructor': 'warn', // S6647: useless constructor
    },
  },
  // Type-aware rules - require TypeScript project info, slower but catches more issues
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/prefer-readonly': 'warn',            // S2933: readonly on never-reassigned members
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn', // S4325: unnecessary assertions
      '@typescript-eslint/await-thenable': 'warn',             // S4123: await non-Promise
      '@typescript-eslint/no-misused-promises': 'warn',        // S6544: Promise in void context
      '@typescript-eslint/prefer-includes': 'warn',            // S7765: includes over indexOf
    },
  },
];
