import globals from 'globals'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

export default [
  stylistic.configs['recommended-flat'],
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['./src/**/*.ts', './tests/**/*.ts'],
    plugins: {
      'typescript-eslint': tseslint.plugin,
      '@typescript-eslint': tseslint.plugin,
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        parser: tseslint.parser,
      },
    },
    rules: {
      '@stylistic/max-statements-per-line': 2,
    },
  },
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },
]
