import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.wrangler/**',
      '**/scratch/**',
      '**/coverage/**',
      '**/.output/**',
      '**/*.d.ts',
      '**/migrations/**',
      'scripts/**',
      'flutter/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-extra-boolean-cast': 'off',
      'no-console': 'off',
      'no-undef': 'off'
    }
  }
);
