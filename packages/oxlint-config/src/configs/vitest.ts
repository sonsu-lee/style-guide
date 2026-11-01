import type { OxlintConfig } from 'oxlint';

// Vitest's default test file names, plus the `*.e2e-spec.*` files that NestJS generates.
const testFiles = [
  '**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
  '**/*.e2e-spec.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
];

// The plugin is enabled for test files only; base's categories decide which of its rules run there.
export const vitest: OxlintConfig = {
  plugins: [],
  overrides: [
    {
      files: testFiles,
      plugins: ['vitest'],
      rules: {
        // Tests often stub objects and parse JSON output with assertions. typescript-eslint's
        // docs suggest turning this off for test files.
        'typescript/no-unsafe-type-assertion': 'off',
        // A `describe` callback holds every test in it, so suites pass the 50-line default.
        'max-lines-per-function': 'off',
        // HTTP tests assert through supertest, as NestJS e2e tests do:
        // `request(app.getHttpServer()).get('/').expect(200)`. The other names are Vitest's
        // defaults. Set here because a later override that does not enable the vitest plugin
        // cannot configure its rules.
        'vitest/expect-expect': [
          'error',
          {
            assertFunctionNames: [
              'expect',
              'expectTypeOf',
              'assert',
              'assertType',
              'request.**.expect',
            ],
          },
        ],
      },
    },
  ],
};
