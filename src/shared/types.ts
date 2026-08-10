export interface Envelope<T> {
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
