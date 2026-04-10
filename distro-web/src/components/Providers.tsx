"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { fontFamily: "var(--font-jakarta)", fontSize: "14px" },
          success: { iconTheme: { primary: "#00C46F", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  );
}
