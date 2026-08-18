import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  CreateNotificationTemplatePayload,
  NotificationOverviewData,
  NotificationOverviewPeriod,
  NotificationTemplate,
  NotificationTemplateOptionsData,
  NotificationTemplatePayload,
  NotificationTemplatesData,
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

/**
 * Endpoint: `/api/v1/notifications/templates`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "templates": [{ "id": "template-1", "name": "Leave Approved", "channels": ["Email", "Push"], "status": "Active", "subject": "Your leave request has been approved", "messageBody": "Hi {{employee_name}}, your {{leave_type}} request has been approved.", "updatedAt": "2026-08-19T09:30:00+07:00" }], "availableVariables": ["{{employee_name}}", "{{leave_type}}", "{{date_range}}", "{{approver_name}}"] }, "messages": [] }`
 */
export async function getNotificationTemplates() {
  const res = await apiClient.get<Envelope<NotificationTemplatesData>>(
    '/api/v1/notifications/templates',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/notifications/templates/options`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "triggerEvents": [{ "id": "claim-submitted", "name": "Claim Submitted for Approval" }, { "id": "leave-approved", "name": "Leave Request Approved" }], "recipientTypes": [{ "id": "approver", "name": "Approver", "supportedChannels": ["Email", "Push", "WhatsApp"] }, { "id": "employee", "name": "Employee", "supportedChannels": ["Email", "Push", "WhatsApp"] }], "availableVariables": ["{{employee_name}}", "{{approver_name}}", "{{claim_no}}", "{{claim_amount}}", "{{approver_email}}"] }, "messages": [] }`
 */
export async function getNotificationTemplateOptions() {
  const res = await apiClient.get<Envelope<NotificationTemplateOptionsData>>(
    '/api/v1/notifications/templates/options',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/notifications/templates`
 * Method: `POST`
 * Request body: `{ "name": "Claim Approval Required", "triggerEventId": "claim-submitted", "status": "Draft", "channels": ["Email", "Push", "WhatsApp"], "channelContents": [{ "channel": "Email", "recipientTypeId": "approver", "recipient": "{{approver_email}}", "subject": "Claim approval required - {{employee_name}}", "messageBody": "Hello {{approver_name}}, please review claim {{claim_no}}." }, { "channel": "Push", "recipientTypeId": "approver", "recipient": "{{approver_id}}", "subject": "Claim approval required", "messageBody": "Claim {{claim_no}} requires your approval." }, { "channel": "WhatsApp", "recipientTypeId": "approver", "recipient": "{{approver_phone}}", "messageBody": "Claim {{claim_no}} requires your approval." }] }`
 * Expected response: `{ "success": true, "code": "CREATED", "data": { "id": "template-7", "name": "Claim Approval Required", "triggerEventId": "claim-submitted", "channels": ["Email", "Push", "WhatsApp"], "status": "Draft", "subject": "Claim approval required - {{employee_name}}", "messageBody": "Hello {{approver_name}}, please review claim {{claim_no}}.", "channelContents": [{ "channel": "Email", "recipientTypeId": "approver", "recipient": "{{approver_email}}", "subject": "Claim approval required - {{employee_name}}", "messageBody": "Hello {{approver_name}}, please review claim {{claim_no}}." }], "updatedAt": "2026-08-19T10:00:00+07:00" }, "messages": ["Notification template created successfully"] }`
 */
export async function createNotificationTemplate(payload: CreateNotificationTemplatePayload) {
  const res = await apiClient.post<Envelope<NotificationTemplate>>(
    '/api/v1/notifications/templates',
    payload,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/notifications/templates/:id`
 * Method: `PUT`
 * Request body: `{ "name": "Leave Approved", "triggerEventId": "leave-approved", "channels": ["Email", "Push"], "status": "Active", "channelContents": [{ "channel": "Email", "recipientTypeId": "employee", "recipient": "{{employee_email}}", "subject": "Your leave request has been approved", "messageBody": "Hi {{employee_name}}, your leave request has been approved." }, { "channel": "Push", "recipientTypeId": "employee", "recipient": "{{employee_id}}", "subject": "Leave approved", "messageBody": "Your leave request has been approved." }] }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "template-1", "name": "Leave Approved", "triggerEventId": "leave-approved", "channels": ["Email", "Push"], "status": "Active", "subject": "Your leave request has been approved", "messageBody": "Hi {{employee_name}}, your leave request has been approved.", "channelContents": [{ "channel": "Email", "recipientTypeId": "employee", "recipient": "{{employee_email}}", "subject": "Your leave request has been approved", "messageBody": "Hi {{employee_name}}, your leave request has been approved." }, { "channel": "Push", "recipientTypeId": "employee", "recipient": "{{employee_id}}", "subject": "Leave approved", "messageBody": "Your leave request has been approved." }], "updatedAt": "2026-08-19T10:05:00+07:00" }, "messages": ["Notification template updated successfully"] }`
 */
export async function updateNotificationTemplate(id: string, payload: NotificationTemplatePayload) {
  const res = await apiClient.put<Envelope<NotificationTemplate>>(
    `/api/v1/notifications/templates/${id}`,
    payload,
  )
  return res.data
}
