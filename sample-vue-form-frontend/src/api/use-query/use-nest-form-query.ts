import { useQuery } from "@tanstack/vue-query";
import { apiClient } from "../api-client";
import type { ComputedRef } from "vue";

export const useNestFormQuery = (id: ComputedRef<string>) => {
  return useQuery({
    queryKey: ["nestForm", id],
    queryFn: () => apiClient.getNestForm(id.value),
  });
};
