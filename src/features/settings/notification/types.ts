export type NotificationChannel = 'Email' | 'Push' | 'WhatsApp'
export type NotificationDeliveryStatus = 'Delivered' | 'Failed' | 'Pending' | 'Retrying'
export type NotificationChannelHealthStatus = 'Healthy' | 'Degraded'
export type NotificationOverviewPeriod = 'today' | '7-days' | '30-days'

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
