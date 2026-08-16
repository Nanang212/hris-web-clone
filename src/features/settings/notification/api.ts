import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  NotificationOverviewData,
  NotificationOverviewPeriod,
} from '@/features/settings/notification/types'

/**
 * Endpoint: `/api/v1/notifications/overview`
 * Method: `GET`
 * Query params: `{ "period": "today" | "7-days" | "30-days" }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "period": "7-days", "lastUpdated": "2026-08-16T10:30:00+07:00", "stats": { "emailDelivery": { "rate": 98.6, "sent": 6842, "failed": 96, "changePercentage": 0.8 }, "pushDelivery": { "rate": 96.4, "sent": 5218, "failed": 188, "changePercentage": 0.3 }, "whatsappDelivery": { "rate": 93.8, "sent": 2405, "failed": 149, "changePercentage": -1.4 }, "activeTemplates": { "active": 42, "draft": 3, "change": 3 } }, "events": [{ "id": "notification-1", "title": "Leave request approved", "channels": ["Email", "Push"], "recipient": "Sinta Maharani", "sentAt": "2026-08-16T09:42:00+07:00", "status": "Delivered" }, { "id": "notification-2", "title": "Contract renewal reminder", "channels": ["Email", "WhatsApp"], "recipient": "HR Manager", "sentAt": "2026-08-16T08:15:00+07:00", "status": "Failed", "failureReason": "Recipient number is not registered", "providerMessage": "WhatsApp provider rejected the destination number" }], "channels": [{ "channel": "Email", "description": "Employee work email", "status": "Healthy", "enabled": true }, { "channel": "Push", "description": "HRIS mobile application", "status": "Healthy", "enabled": true }, { "channel": "WhatsApp", "description": "Employee HR number", "status": "Degraded", "enabled": true }] }, "messages": [] }`
 */
export async function getNotificationOverview(period: NotificationOverviewPeriod) {
  const res = await apiClient.get<Envelope<NotificationOverviewData>>(
    '/api/v1/notifications/overview',
    { params: { period } },
  )
  return res.data
}
