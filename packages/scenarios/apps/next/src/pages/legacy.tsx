import Link from 'next/link';

export default function LegacyOrdersPage() {
  return (
    <>
      {/* expect: warning next(no-head-element) -- Pages Router metadata belongs in next/head. */}
      <head>
        <meta name="description" content="Manage your orders" />
      </head>
      <main>
        {/* expect: error next(no-html-link-for-pages) -- This internal link reloads the page. */}
        <a href="/orders">View orders</a>
        <Link href="/orders">Track an order</Link>
      </main>
    </>
  );
}
