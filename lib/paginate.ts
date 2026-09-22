export interface PaginateParams {
  page?: number
  limit?: number
  sortBy?: string
  orderBy?: "asc" | "desc"
  search?: string
}

export interface Paginated<T> {
  members: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function toSearchParams(params?: PaginateParams): string {
  if (!params) return ""

  const searchParams = new URLSearchParams()
  if (params.page != null) searchParams.set("page", String(params.page))
  if (params.limit != null) searchParams.set("limit", String(params.limit))
  if (params.sortBy) searchParams.set("sortBy", params.sortBy)
  if (params.orderBy) searchParams.set("orderBy", params.orderBy)
  if (params.search) searchParams.set("search", params.search)

  const query = searchParams.toString()
  return query ? `?${query}` : ""
}

/** Fiber/PHP multi-value style: `key[]=a&key[]=b`. */
export function appendArrayParams(
  searchParams: URLSearchParams,
  key: string,
  values: readonly string[]
) {
  for (const value of values) {
    searchParams.append(`${key}[]`, value)
  }
}
