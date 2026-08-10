const BASE_URL = 'http://localhost:8080/api/v1'

export interface DashboardQueryRequest {
  role: 'HR' | 'EMPLOYEE' | 'MANAGER' | 'EXECUTIVE'
  location?: string
  company?: string
  date?: string
}

export async function fetchDashboard(req: DashboardQueryRequest) {
  const response = await fetch(`${BASE_URL}/dashboard/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.message || `Failed to fetch dashboard: ${response.status}`)
  }

  const result = await response.json()
  return result.data
}
