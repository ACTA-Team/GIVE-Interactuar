'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActaConfig } from '@acta-team/acta-sdk';
import { WalletProvider } from '@/lib/stellar/WalletContext';
import { useState, type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

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

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ActaConfig
          baseURL={
            process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
              ? 'https://acta.build/api/mainnet'
              : 'https://acta.build/api/testnet'
          }
          apiKey={process.env.NEXT_PUBLIC_ACTA_API_KEY}
        >
          {children}
        </ActaConfig>
      </WalletProvider>
    </QueryClientProvider>
  );
}
