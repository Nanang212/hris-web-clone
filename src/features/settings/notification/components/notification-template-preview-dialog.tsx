import { IconBrandWhatsapp, IconDeviceMobile, IconMail } from '@tabler/icons-react'
import { useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Separator } from '@/shared/components/ui/separator'
import { Spinner } from '@/shared/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import type {
  NotificationChannel,
  NotificationTemplateOptionsData,
} from '@/features/settings/notification/types'
import { m } from '@/i18n/paraglide/messages'

export interface NotificationTemplatePreviewContent {
  recipientTypeId: string
  recipient: string
  subject: string
  messageBody: string
}

interface NotificationTemplatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  triggerEventId: string
  channels: NotificationChannel[]
  contents: Record<NotificationChannel, NotificationTemplatePreviewContent>
  options: NotificationTemplateOptionsData
  isSaving: boolean
  onSave: () => void
}

function getChannelLabel(channel: NotificationChannel) {
  const labels: Record<NotificationChannel, string> = {
    Email: m.notification_overview_channel_email(),
    Push: m.notification_overview_channel_push(),
    WhatsApp: m.notification_overview_channel_whatsapp(),
  }
  return labels[channel]
}

function getChannelIcon(channel: NotificationChannel) {
  const icons = {
    Email: IconMail,
    Push: IconDeviceMobile,
    WhatsApp: IconBrandWhatsapp,
  }
  return icons[channel]
}

function getChannelBadgeVariant(channel: NotificationChannel) {
  const variants = {
    Email: 'blue',
    Push: 'green',
    WhatsApp: 'teal',
  } as const
  return variants[channel]
}

export function NotificationTemplatePreviewDialog({
  open,
  onOpenChange,
  name,
  triggerEventId,
  channels,
  contents,
  options,
  isSaving,
  onSave,
}: NotificationTemplatePreviewDialogProps) {
  const [activeChannel, setActiveChannel] = useState<NotificationChannel>('Email')
  const displayedChannel = channels.includes(activeChannel)
    ? activeChannel
    : (channels[0] ?? 'Email')
  const activeContent = contents[displayedChannel]
  const triggerName =
    options.triggerEvents.find((event) => event.id === triggerEventId)?.name ??
    m.notification_templates_preview_empty()
  const recipientTypeName =
    options.recipientTypes.find((type) => type.id === activeContent.recipientTypeId)?.name ??
    m.notification_templates_preview_empty()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>{m.notification_template_preview_title()}</DialogTitle>
          <DialogDescription>{m.notification_template_preview_description()}</DialogDescription>
        </DialogHeader>

        <Card size='sm'>
          <CardHeader>
            <CardTitle>{m.notification_template_preview_summary_title()}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='flex min-w-0 flex-col gap-1'>
              <CardDescription>{m.notification_template_preview_template_label()}</CardDescription>
              <p className='truncate font-medium'>
                {name || m.notification_templates_preview_untitled()}
              </p>
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <CardDescription>{m.notification_template_preview_trigger_label()}</CardDescription>
              <p className='truncate font-medium'>{triggerName}</p>
            </div>
            <div className='flex min-w-0 flex-col gap-1'>
              <CardDescription>{m.notification_template_preview_recipient_label()}</CardDescription>
              <p className='truncate font-medium'>{recipientTypeName}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <CardDescription>{m.notification_template_preview_channels_label()}</CardDescription>
              <div className='flex flex-wrap gap-2'>
                {channels.map((channel) => (
                  <Badge key={channel} variant={getChannelBadgeVariant(channel)}>
                    {getChannelLabel(channel)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={displayedChannel}
          onValueChange={(value) => setActiveChannel(value as NotificationChannel)}
          orientation='vertical'
          className='grid items-start gap-4 lg:grid-cols-[minmax(220px,0.55fr)_minmax(0,1.45fr)]'
        >
          <Card size='sm'>
            <CardHeader>
              <CardTitle>{m.notification_template_preview_channel_list_title()}</CardTitle>
              <CardDescription>
                {m.notification_template_preview_channel_list_description()}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <TabsList variant='segmented' className='w-full items-stretch'>
                {channels.map((channel) => {
                  const Icon = getChannelIcon(channel)
                  const selected = displayedChannel === channel
                  return (
                    <TabsTrigger key={channel} value={channel}>
                      <Icon data-icon='inline-start' />
                      <span className='flex min-w-0 flex-col items-start gap-0.5'>
                        <span className='truncate'>{getChannelLabel(channel)}</span>
                        <span className='text-xs font-normal'>
                          {selected
                            ? m.notification_template_preview_selected()
                            : m.notification_template_preview_tap_to_preview()}
                        </span>
                      </span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <Separator />

              <div className='flex flex-col gap-3'>
                <CardTitle>{m.notification_template_preview_recipient_details_title()}</CardTitle>
                <div className='grid gap-3'>
                  <div className='flex flex-col gap-1'>
                    <CardDescription>
                      {m.notification_template_preview_recipient_type_label()}
                    </CardDescription>
                    <p className='font-medium'>{recipientTypeName}</p>
                  </div>
                  <div className='flex min-w-0 flex-col gap-1'>
                    <CardDescription>
                      {m.notification_template_preview_destination_label()}
                    </CardDescription>
                    <p className='font-medium break-all'>
                      {activeContent.recipient || m.notification_templates_preview_empty()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {channels.map((channel) => {
            const content = contents[channel]
            return (
              <TabsContent key={channel} value={channel}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {m.notification_template_preview_channel_title({
                        channel: getChannelLabel(channel),
                      })}
                    </CardTitle>
                    <CardAction>
                      <Badge variant={getChannelBadgeVariant(channel)}>
                        {getChannelLabel(channel)}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <Card size='sm'>
                      <CardHeader>
                        <CardTitle>{m.app_layout_brand_name()}</CardTitle>
                        <CardDescription>
                          {m.notification_template_preview_to_label({
                            recipient:
                              content.recipient || m.notification_templates_preview_empty(),
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='flex flex-col gap-5'>
                        <Separator />
                        {channel !== 'WhatsApp' && (
                          <p className='text-base font-semibold'>
                            {content.subject || m.notification_templates_preview_empty()}
                          </p>
                        )}
                        <p className='leading-relaxed whitespace-pre-wrap'>
                          {content.messageBody || m.notification_templates_preview_empty()}
                        </p>
                        <Separator />
                        <CardDescription>
                          {m.notification_template_preview_delivery_notice()}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {m.notification_template_preview_back_to_edit()}
          </Button>
          <Button type='button' disabled={isSaving} onClick={onSave}>
            {isSaving && <Spinner data-icon='inline-start' />}
            {m.notification_templates_save_button()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
