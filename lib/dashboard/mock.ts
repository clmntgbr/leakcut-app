export const MOCK_DASHBOARD_CARDS = [
  {
    id: "videos",
    label: "Videos scanned",
    value: "128",
    delta: "+12.5%",
    trend: "up" as const,
    headline: "Trending up this month",
    detail: "Uploads over the last 6 months",
  },
  {
    id: "classified",
    label: "Classified",
    value: "96",
    delta: "+8.2%",
    trend: "up" as const,
    headline: "Pipeline completing faster",
    detail: "Finished reviews this period",
  },
  {
    id: "confidential",
    label: "Confidential",
    value: "31",
    delta: "+18%",
    trend: "up" as const,
    headline: "More leaks detected",
    detail: "Videos with a confidential finding",
  },
  {
    id: "risk",
    label: "Average risk",
    value: "42%",
    delta: "-4.1%",
    trend: "down" as const,
    headline: "Risk slightly down",
    detail: "Mean peak score across videos",
  },
] as const

export const MOCK_FINDING_MIX = [
  { name: "clean", value: 65 },
  { name: "personal", value: 18 },
  { name: "confidential", value: 12 },
  { name: "keys", value: 5 },
] as const

export const MOCK_SIX_MONTH_SERIES = [
  { month: "Apr", videos: 12, confidential: 3 },
  { month: "May", videos: 18, confidential: 5 },
  { month: "Jun", videos: 21, confidential: 4 },
  { month: "Jul", videos: 16, confidential: 7 },
  { month: "Aug", videos: 24, confidential: 8 },
  { month: "Sep", videos: 28, confidential: 9 },
] as const
