export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly body?: unknown

  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.body = body
  }
}

export interface WrongOrganizationErrorBody {
  code: "WRONG_ORGANIZATION"
  message: string
  clientId: string
  clientName: string
}

export function isWrongOrganizationError(
  error: unknown
): error is ApiError & { body: WrongOrganizationErrorBody } {
  if (!(error instanceof ApiError) || error.status !== 409) {
    return false
  }

  const body = error.body as Partial<WrongOrganizationErrorBody> | undefined
  return (
    body?.code === "WRONG_ORGANIZATION" &&
    typeof body.clientId === "string" &&
    typeof body.clientName === "string"
  )
}

export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<ApiError> {
  const body = await response.json().catch(() => null)
  const message =
    (body && typeof body === "object" && "message" in body
      ? String((body as { message: unknown }).message)
      : null) || fallbackMessage
  const code =
    body && typeof body === "object" && "code" in body
      ? String((body as { code: unknown }).code)
      : undefined

  return new ApiError(message, response.status, code, body)
}
