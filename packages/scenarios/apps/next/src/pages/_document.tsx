import { Head, Html, Main, NextScript } from 'next/document';
// expect: error next(no-head-import-in-document) -- The custom Document needs its own Head component.
import PageHead from 'next/head';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <PageHead>
          <meta name="application-name" content="Orders" />
        </PageHead>
        <Main />
        {/* expect: error next(no-sync-scripts) -- This synchronous script blocks parsing. */}
        <script src="/tracking.js" />
        <NextScript />
      </body>
    </Html>
  );
}
