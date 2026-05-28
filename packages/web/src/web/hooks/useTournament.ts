import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useActiveTournament() {
  return useQuery({
    queryKey: ["tournament", "active"],
    queryFn: async () => {
      const res = await api.tournaments.active.$get();
      return res.json();
    },
    staleTime: 30_000,
  });
}
