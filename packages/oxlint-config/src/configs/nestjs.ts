import type { OxlintConfig } from 'oxlint';

// Adjusts rules that report code the NestJS CLI (@nestjs/schematics) generates.
// preset() places this after the typescript and typeAware profiles.
export const nestjs: OxlintConfig = {
  plugins: [],
  rules: {
    // Reports Nest modules such as `@Module({}) export class AppModule {}`.
    'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],
  },
  overrides: [
    {
      // The CommonJS template cannot use top-level await, so main.ts ends with `void bootstrap()`.
      files: ['**/main.ts'],
      rules: {
        'unicorn/prefer-top-level-await': 'off',
        'typescript/no-floating-promises': ['error', { ignoreVoid: true }],
      },
    },
  ],
};
