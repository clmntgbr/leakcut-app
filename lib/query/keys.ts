import { PaginateParams } from "@/lib/paginate"

export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: ["user", "me"] as const,
  },

  videos: {
    all: ["videos"] as const,
    detail: (videoId: string) => ["videos", videoId] as const,
  },

  clients: {
    all: ["clients"] as const,
    lists: () => [...queryKeys.clients.all, "list"] as const,
    list: (params?: PaginateParams) =>
      [...queryKeys.clients.lists(), params ?? {}] as const,
    detail: (clientId: string) => ["clients", clientId] as const,
  },

  campaigns: {
    all: (clientId: string) =>
      [...queryKeys.clients.detail(clientId), "campaigns"] as const,
    list: (clientId: string, params?: PaginateParams) =>
      [...queryKeys.campaigns.all(clientId), "list", params ?? {}] as const,
    detail: (clientId: string, campaignId: string) =>
      [...queryKeys.campaigns.all(clientId), campaignId] as const,
  },

  media: {
    all: (clientId: string) =>
      [...queryKeys.clients.detail(clientId), "media"] as const,
    lists: (clientId: string) =>
      [...queryKeys.media.all(clientId), "list"] as const,
    list: (
      clientId: string,
      params?: PaginateParams & { campaignId?: string | null }
    ) => [...queryKeys.media.lists(clientId), params ?? {}] as const,
    detail: (clientId: string, mediaId: string) =>
      [...queryKeys.media.all(clientId), mediaId] as const,
    infinite: (
      clientId: string,
      filters: {
        limit?: number
        campaignIds?: string[]
        search?: string | null
        statuses?: string[]
        verdicts?: string[]
        from?: string | null
        to?: string | null
      } = {}
    ) =>
      [
        ...queryKeys.media.all(clientId),
        "infinite",
        {
          limit: filters.limit ?? 20,
          campaignIds: filters.campaignIds?.length
            ? [...filters.campaignIds].sort()
            : [],
          search: filters.search?.trim() || null,
          statuses: filters.statuses?.length
            ? [...filters.statuses].sort()
            : [],
          verdicts: filters.verdicts?.length
            ? [...filters.verdicts].sort()
            : [],
          from: filters.from?.trim() || null,
          to: filters.from?.trim() ? filters.to?.trim() || null : null,
        },
      ] as const,
    stats: (
      clientId: string,
      filters: {
        campaignId?: string | null
        from?: string | null
        to?: string | null
      } = {}
    ) =>
      [
        ...queryKeys.media.all(clientId),
        "stats",
        {
          campaignId: filters.campaignId?.trim() || "all",
          from: filters.from?.trim() || null,
          to: filters.to?.trim() || null,
        },
      ] as const,
  },

  activity: {
    all: (clientId: string) =>
      [...queryKeys.clients.detail(clientId), "activity"] as const,
    list: (clientId: string, params?: PaginateParams) =>
      [...queryKeys.activity.all(clientId), "list", params ?? {}] as const,
    infinite: (
      clientId: string,
      filters: {
        limit?: number
        campaignIds?: string[]
        search?: string | null
        from?: string | null
        to?: string | null
      } = {}
    ) =>
      [
        ...queryKeys.activity.all(clientId),
        "infinite",
        {
          limit: filters.limit ?? 20,
          campaignIds: filters.campaignIds?.length
            ? [...filters.campaignIds].sort()
            : [],
          search: filters.search?.trim() || null,
          from: filters.from?.trim() || null,
          to: filters.from?.trim() ? filters.to?.trim() || null : null,
        },
      ] as const,
  },

  plans: {
    all: ["plans"] as const,
  },

  subscription: {
    detail: (clientId: string) =>
      [...queryKeys.clients.detail(clientId), "subscription"] as const,
  },

  quota: {
    detail: (clientId: string) =>
      [...queryKeys.clients.detail(clientId), "quota"] as const,
  },

  invoices: {
    all: (clientId: string) =>
      [...queryKeys.clients.detail(clientId), "invoices"] as const,
    list: (
      clientId: string,
      params?: Pick<PaginateParams, "page" | "limit" | "sortBy" | "orderBy">
    ) => [...queryKeys.invoices.all(clientId), "list", params ?? {}] as const,
  },

  checks: {
    all: (campaignId: string) => ["campaigns", campaignId, "checks"] as const,
  },
} as const
