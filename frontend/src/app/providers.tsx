'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActaConfig } from '@acta-team/acta-sdk';
import { WalletProvider } from '@/lib/stellar/WalletContext';
import { useState, type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

const actaApiKey = process.env.NEXT_PUBLIC_ACTA_API_KEY;
const actaBaseURL =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
    ? 'https://acta.build/api/mainnet'
    : 'https://acta.build/api/testnet';

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  const content = actaApiKey ? (
    <ActaConfig baseURL={actaBaseURL} apiKey={actaApiKey}>
      {children}
    </ActaConfig>
  ) : (
    children
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>{content}</WalletProvider>
    </QueryClientProvider>
  );
}
