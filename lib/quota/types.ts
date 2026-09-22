export interface MonthlyQuotaCounter {
  periodStart: string
  periodEnd: string
  used: number
  max: number
  left: number
}

export interface QuotaCounter {
  used: number
  max: number
  left: number
}

export interface QuotaLimits {
  maxFileSizeMb: number
  reportRetentionDays: number
  allowsVideoAnalysis: boolean
  allowsPdfExport: boolean
  allowsCsvExport: boolean
  allowsApiAccess: boolean
  overagePriceCents: number
  analysisPriority: number
  maxDetectorsPerAnalysis: number
  maxFramesPerVideo: number
  allowsReanalysis: boolean
  maxStorageGb: number
  maxBatchUploadSize: number
  frameRetentionDays: number
  allowsCustomRuleset: boolean
  allowsWhiteLabelReport: boolean
  allowsWebhooks: boolean
  quotaOverageGraceVerifications: number
}

export interface QuotaUsage {
  members: QuotaCounter
  campaigns: QuotaCounter
  verifications: MonthlyQuotaCounter
  concurrentAnalyses: QuotaCounter
  limits: QuotaLimits
  periodStart: string
  periodEnd: string
}
