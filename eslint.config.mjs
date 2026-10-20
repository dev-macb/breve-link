import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
    { ignores: ['**/node_modules/**', '**/build/**', '**/dist/**', 'server/public/**', '**/coverage/**', '.npm-cache/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            // Mantém compatibilidade com os contratos legados; não desliga checagem de tipos do tsc.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-object-type': ['error', { allowObjectTypes: 'always' }],
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', ignoreRestSiblings: true
            }]
        }
    },
    { files: ['server/**/*.ts'], languageOptions: { globals: globals.node } },
    { files: ['server/tests/**/*.ts'], languageOptions: { globals: globals.jest } },
    { files: ['web/**/*.ts', 'web/**/*.tsx'], languageOptions: { globals: globals.browser } },
    { files: ['web/src/**/*.{ts,tsx}'], plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh }, rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'error',
        'react-refresh/only-export-components': ['error', { allowConstantExport: true, allowExportNames: ['useSessao', 'useAviso'] }]
    } },
    { files: ['web/vite.config.ts'], languageOptions: { globals: globals.node } },
    { files: ['**/*.mjs'], languageOptions: { globals: globals.node } }
);
