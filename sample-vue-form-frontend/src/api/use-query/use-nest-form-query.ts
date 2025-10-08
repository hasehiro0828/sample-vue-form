import { useQuery } from "@tanstack/vue-query";
import type { ComputedRef } from "vue";
import { apiClient } from "../api-client";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useNestFormQuery = (id: ComputedRef<string>) => {
  return useQuery({
    queryKey: ["nestForm", id],
    queryFn: async () => {
      const result = apiClient.getNestForm(id.value);
      await sleep(300);

      return result;
    },
  });
};
