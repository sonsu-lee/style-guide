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
      // The CommonJS template ends main.ts with `void bootstrap()`, where top-level await is not
      // available.
      files: ['**/main.ts'],
      rules: { 'unicorn/prefer-top-level-await': 'off' },
    },
  ],
};
