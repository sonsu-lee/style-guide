import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

const browserQueryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export function ResettingOrderProvider({ children }: Props) {
  // expect: error @tanstack/query(stable-query-client) -- A parent render replaces the order cache.
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function SharedOrderProvider({ children }: Props) {
  return <QueryClientProvider client={browserQueryClient}>{children}</QueryClientProvider>;
}

export function IsolatedOrderProvider({ children }: Props) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
