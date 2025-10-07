import { useQuery } from "@tanstack/vue-query";
import { apiClient } from "../api-client";

export const useNestFormQuery = (id: string) => {
  return useQuery({
    queryKey: ["nestForm", id],
    queryFn: () => apiClient.getNestForm(id),
  });
};
