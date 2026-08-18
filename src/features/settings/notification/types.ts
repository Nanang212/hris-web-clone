export type NotificationChannel = 'Email' | 'Push' | 'WhatsApp'
export type NotificationDeliveryStatus = 'Delivered' | 'Failed' | 'Pending' | 'Retrying'
export type NotificationChannelHealthStatus = 'Healthy' | 'Degraded'
export type NotificationOverviewPeriod = 'today' | '7-days' | '30-days'
export type NotificationTemplateStatus = 'Active' | 'Draft' | 'Inactive'

export interface NotificationDeliveryMetric {
  rate: number
  sent: number
  failed: number
  changePercentage: number
}

export interface NotificationTemplateMetric {
  active: number
  draft: number
  change: number
}

export interface NotificationEvent {
  id: string
  title: string
  channels: NotificationChannel[]
  recipient: string
  sentAt: string
  status: NotificationDeliveryStatus
  failureReason?: string
  providerMessage?: string
}

export interface NotificationChannelHealth {
  channel: NotificationChannel
  description: string
  status: NotificationChannelHealthStatus
  enabled: boolean
}

export interface NotificationOverviewStats {
  emailDelivery: NotificationDeliveryMetric
  pushDelivery: NotificationDeliveryMetric
  whatsappDelivery: NotificationDeliveryMetric
  activeTemplates: NotificationTemplateMetric
}

export interface NotificationOverviewData {
  period: NotificationOverviewPeriod
  lastUpdated: string
  stats: NotificationOverviewStats
  events: NotificationEvent[]
  channels: NotificationChannelHealth[]
}

export interface NotificationTemplate {
  id: string
  name: string
  channels: NotificationChannel[]
  status: NotificationTemplateStatus
  subject: string
  messageBody: string
  updatedAt: string
  triggerEventId?: string
  channelContents?: NotificationTemplateChannelContent[]
}

export interface NotificationTemplatesData {
  templates: NotificationTemplate[]
  availableVariables: string[]
}

export interface NotificationTemplatePayload {
  name: string
  triggerEventId: string
  channels: NotificationChannel[]
  status: NotificationTemplateStatus
  channelContents: NotificationTemplateChannelContent[]
}

export interface NotificationTemplateTriggerEvent {
  id: string
  name: string
}

export interface NotificationTemplateRecipientType {
  id: string
  name: string
  supportedChannels: NotificationChannel[]
}

export interface NotificationTemplateOptionsData {
  triggerEvents: NotificationTemplateTriggerEvent[]
  recipientTypes: NotificationTemplateRecipientType[]
  availableVariables: string[]
}

export interface NotificationTemplateChannelContent {
  channel: NotificationChannel
  recipientTypeId: string
  recipient: string
  subject?: string
  messageBody: string
}

export interface CreateNotificationTemplatePayload {
  name: string
  triggerEventId: string
  status: NotificationTemplateStatus
  channels: NotificationChannel[]
  channelContents: NotificationTemplateChannelContent[]
}
