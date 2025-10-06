'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes for most data
        gcTime: 30 * 60 * 1000, // 30 minutes in cache
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}