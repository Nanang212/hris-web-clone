export interface Envelope<T = undefined> {
  success: boolean
  code: string
  data: T
  messages: string[]
}
export interface PaginatedData<T> {
  items: T[]
  hasNext: boolean
  nextCursor: string | null
}
