import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 4_000,
      refetchOnWindowFocus: true,
    },
  },
});
