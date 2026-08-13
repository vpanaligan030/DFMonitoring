import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist/**', 'assets/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'test/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
];
