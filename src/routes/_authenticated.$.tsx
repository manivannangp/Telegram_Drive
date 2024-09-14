import type { FilterQuery, QueryParams } from "@/types";
import { createFileRoute } from "@tanstack/react-router";

import { extractPathParts } from "@/utils/common";
import { fileQueries } from "@/utils/queryOptions";

const allowedTypes = ["my-drive", "recent", "search", "storage", "category", "browse", "shared"];

export const Route = createFileRoute("/_authenticated/$")({
  beforeLoad: ({ params }) => {
    const { type, path } = extractPathParts(params._splat!);
    if (!allowedTypes.includes(type)) {
      throw new Error("invalid path");
    }
    return { queryParams: { type, path } };
  },
  validateSearch: (search: Record<string, unknown>) => search as FilterQuery,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient, queryParams }, preload, deps }) => {
    let params = queryParams as QueryParams;
    if (
      (queryParams.type === "search" || queryParams.type === "browse") &&
      Object.keys(deps).length > 0
    ) {
      params = { ...queryParams, filter: deps };
    }

    if (preload) {
      await queryClient.prefetchInfiniteQuery(fileQueries.list(params));
    } else {
      queryClient.fetchInfiniteQuery(fileQueries.list(params));
    }
  },
  wrapInSuspense: true,
});
