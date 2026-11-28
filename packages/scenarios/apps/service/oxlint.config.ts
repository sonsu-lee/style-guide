import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(
  preset(
    { node: true },
    {
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@/vendor/analytics-sdk',
                message:
                  'Send events through @/logging/track so every event is masked the same way.',
              },
            ],
            patterns: [
              {
                group: ['@/features/*/internal', '@/features/*/internal/**'],
                message: 'Import from the feature entry point, for example @/features/orders.',
              },
            ],
          },
        ],
      },
      overrides: [
        { files: ['src/boundaries/logging/**'], rules: { 'no-restricted-imports': 'off' } },
      ],
    },
  ),
);
