"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

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

  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  // If we haven't hydrated from localStorage yet, render nothing or a loader
  // to prevent components from seeing a null token and triggering redirects.
  if (!hasHydrated) return null;

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
