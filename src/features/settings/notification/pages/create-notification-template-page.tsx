import { zodResolver } from '@hookform/resolvers/zod'
import { IconEye } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { NotificationTemplatePreviewDialog } from '@/features/settings/notification/components/notification-template-preview-dialog'
import {
  useCreateNotificationTemplate,
  useGetNotificationTemplateOptions,
} from '@/features/settings/notification/hooks'
import type {
  CreateNotificationTemplatePayload,
  NotificationChannel,
  NotificationTemplateStatus,
} from '@/features/settings/notification/types'
import { m } from '@/i18n/paraglide/messages'

const channelOptions: NotificationChannel[] = ['Email', 'Push', 'WhatsApp']
const statusOptions: NotificationTemplateStatus[] = ['Draft', 'Active', 'Inactive']

function getChannelLabel(channel: NotificationChannel) {
  const labels: Record<NotificationChannel, string> = {
    Email: m.notification_overview_channel_email(),
    Push: m.notification_overview_channel_push(),
    WhatsApp: m.notification_overview_channel_whatsapp(),
  }
  return labels[channel]
}

function getChannelContentTitle(channel: NotificationChannel) {
  const labels: Record<NotificationChannel, string> = {
    Email: m.notification_template_create_email_content(),
    Push: m.notification_template_create_push_content(),
    WhatsApp: m.notification_template_create_whatsapp_content(),
  }
  return labels[channel]
}

function getRecipientLabel(channel: NotificationChannel) {
  const labels: Record<NotificationChannel, string> = {
    Email: m.notification_template_create_recipient_email_label(),
    Push: m.notification_template_create_recipient_push_label(),
    WhatsApp: m.notification_template_create_recipient_whatsapp_label(),
  }
  return labels[channel]
}

function getStatusLabel(status: NotificationTemplateStatus) {
  const labels: Record<NotificationTemplateStatus, string> = {
    Active: m.notification_templates_status_active(),
    Draft: m.notification_templates_status_draft(),
    Inactive: m.notification_templates_status_inactive(),
  }
  return labels[status]
}

export function CreateNotificationTemplatePage() {
  const navigate = useNavigate()
  const optionsQuery = useGetNotificationTemplateOptions()
  const createMutation = useCreateNotificationTemplate()
  const [activeChannel, setActiveChannel] = useState<NotificationChannel>('Email')
  const [previewOpen, setPreviewOpen] = useState(false)

  const baseSchema = useSchema((z) => ({
    name: z
      .string()
      .trim()
      .min(1, { message: m.notification_templates_name_required() })
      .max(100, { message: m.notification_templates_name_max() }),
    triggerEventId: z
      .string()
      .min(1, { message: m.notification_template_create_trigger_required() }),
    status: z.enum(['Active', 'Draft', 'Inactive']),
    channels: z
      .array(z.enum(['Email', 'Push', 'WhatsApp']))
      .min(1, { message: m.notification_templates_channels_required() }),
    contents: z.object({
      Email: z.object({
        recipientTypeId: z.string(),
        recipient: z.string(),
        subject: z.string(),
        messageBody: z.string(),
      }),
      Push: z.object({
        recipientTypeId: z.string(),
        recipient: z.string(),
        subject: z.string(),
        messageBody: z.string(),
      }),
      WhatsApp: z.object({
        recipientTypeId: z.string(),
        recipient: z.string(),
        subject: z.string(),
        messageBody: z.string(),
      }),
    }),
  }))
  const formSchema = useMemo(
    () =>
      baseSchema.superRefine((values, context) => {
        values.channels.forEach((channel) => {
          const content = values.contents[channel]
          if (!content.recipientTypeId) {
            context.addIssue({
              code: 'custom',
              path: ['contents', channel, 'recipientTypeId'],
              message: m.notification_template_create_recipient_type_required(),
            })
          }
          if (!content.recipient.trim()) {
            context.addIssue({
              code: 'custom',
              path: ['contents', channel, 'recipient'],
              message: m.notification_template_create_recipient_required(),
            })
          }
          if (channel !== 'WhatsApp' && !content.subject.trim()) {
            context.addIssue({
              code: 'custom',
              path: ['contents', channel, 'subject'],
              message: m.notification_templates_subject_required(),
            })
          }
          if (!content.messageBody.trim()) {
            context.addIssue({
              code: 'custom',
              path: ['contents', channel, 'messageBody'],
              message: m.notification_templates_message_required(),
            })
          }
        })
      }),
    [baseSchema],
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      triggerEventId: '',
      status: 'Draft',
      channels: ['Email', 'Push', 'WhatsApp'],
      contents: {
        Email: { recipientTypeId: '', recipient: '', subject: '', messageBody: '' },
        Push: { recipientTypeId: '', recipient: '', subject: '', messageBody: '' },
        WhatsApp: { recipientTypeId: '', recipient: '', subject: '', messageBody: '' },
      },
    },
  })
  const selectedChannels = useWatch({ control, name: 'channels' })
  const previewName = useWatch({ control, name: 'name' })
  const previewTriggerEventId = useWatch({ control, name: 'triggerEventId' })
  const previewContents = useWatch({ control, name: 'contents' })

  if (optionsQuery.isPending || optionsQuery.error || !optionsQuery.data) {
    return (
      <AppMain
        pending={optionsQuery.isPending}
        error={optionsQuery.error}
        retry={() => void optionsQuery.refetch()}
        notFound={!optionsQuery.data}
      />
    )
  }

  const submitTemplate = (
    values: z.infer<typeof formSchema>,
    statusOverride?: NotificationTemplateStatus,
  ) => {
    const payload: CreateNotificationTemplatePayload = {
      name: values.name,
      triggerEventId: values.triggerEventId,
      status: statusOverride ?? values.status,
      channels: values.channels,
      channelContents: values.channels.map((channel) => ({
        channel,
        recipientTypeId: values.contents[channel].recipientTypeId,
        recipient: values.contents[channel].recipient,
        subject: channel === 'WhatsApp' ? undefined : values.contents[channel].subject,
        messageBody: values.contents[channel].messageBody,
      })),
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        snackbar.success(m.notification_templates_create_success())
        void navigate({ to: '/settings/notification/templates' })
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/settings/notification', label: m.notification_overview_title() },
        { to: '/settings/notification/templates', label: m.notification_templates_title() },
        { label: m.notification_template_create_title() },
      ]}
      backTo='/settings/notification/templates'
      title={m.notification_template_create_title()}
      subtitle={m.notification_template_create_subtitle()}
      actions={
        <Button
          type='button'
          variant='outline'
          disabled={createMutation.isPending}
          onClick={() => void handleSubmit((values) => submitTemplate(values, 'Draft'))()}
        >
          {createMutation.isPending && <Spinner data-icon='inline-start' />}
          {m.notification_template_create_save_draft()}
        </Button>
      }
    >
      <form onSubmit={handleSubmit((values) => submitTemplate(values))} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{m.notification_template_create_basic_information()}</CardTitle>
            <CardDescription>{m.notification_template_create_basic_description()}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldGroup className='grid md:grid-cols-3'>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor='create-template-name'>
                    {m.notification_templates_name_label()}
                  </FieldLabel>
                  <Input
                    id='create-template-name'
                    placeholder={m.notification_templates_name_placeholder()}
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                  <FieldDescription>
                    {m.notification_template_create_basic_description()}
                  </FieldDescription>
                  <FieldError errors={errors.name ? [errors.name] : undefined} />
                </Field>

                <Controller
                  name='triggerEventId'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.triggerEventId}>
                      <FieldLabel htmlFor='create-template-trigger'>
                        {m.notification_template_create_trigger_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id='create-template-trigger'
                          className='w-full'
                          aria-invalid={!!errors.triggerEventId}
                        >
                          <SelectValue
                            placeholder={m.notification_template_create_trigger_placeholder()}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {optionsQuery.data.triggerEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {m.notification_template_create_trigger_description()}
                      </FieldDescription>
                      <FieldError
                        errors={errors.triggerEventId ? [errors.triggerEventId] : undefined}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.status}>
                      <FieldLabel htmlFor='create-template-status'>
                        {m.notification_template_create_status_label()}
                      </FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id='create-template-status'
                          className='w-full'
                          aria-invalid={!!errors.status}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {m.notification_template_create_status_description()}
                      </FieldDescription>
                      <FieldError errors={errors.status ? [errors.status] : undefined} />
                    </Field>
                  )}
                />
              </FieldGroup>

              <Controller
                name='channels'
                control={control}
                render={({ field }) => (
                  <FieldSet>
                    <FieldLegend variant='label'>
                      {m.notification_templates_channels_label()}
                    </FieldLegend>
                    <FieldDescription>
                      {m.notification_template_create_channels_description()}
                    </FieldDescription>
                    <Field data-invalid={!!errors.channels}>
                      <FieldGroup data-slot='checkbox-group' className='grid md:grid-cols-3'>
                        {channelOptions.map((channel) => {
                          const checked = field.value.includes(channel)
                          const id = `create-template-channel-${channel.toLowerCase()}`
                          return (
                            <FieldLabel key={channel} htmlFor={id}>
                              <Field orientation='horizontal'>
                                <Checkbox
                                  id={id}
                                  checked={checked}
                                  aria-invalid={!!errors.channels}
                                  onCheckedChange={(value) => {
                                    const nextChannels =
                                      value === true
                                        ? [...field.value, channel]
                                        : field.value.filter((item) => item !== channel)
                                    field.onChange(nextChannels)
                                    if (value === true && field.value.length === 0) {
                                      setActiveChannel(channel)
                                    } else if (
                                      value !== true &&
                                      activeChannel === channel &&
                                      nextChannels.length > 0
                                    ) {
                                      setActiveChannel(nextChannels[0])
                                    }
                                  }}
                                />
                                <FieldContent>
                                  <FieldTitle>{getChannelLabel(channel)}</FieldTitle>
                                  <FieldDescription>
                                    {checked
                                      ? m.notification_template_create_channel_selected()
                                      : m.notification_template_create_channels_description()}
                                  </FieldDescription>
                                </FieldContent>
                              </Field>
                            </FieldLabel>
                          )
                        })}
                      </FieldGroup>
                      <FieldError errors={errors.channels ? [errors.channels] : undefined} />
                    </Field>
                  </FieldSet>
                )}
              />

              <FieldSet>
                <FieldLegend>{m.notification_template_create_content_title()}</FieldLegend>
                <FieldDescription>
                  {m.notification_template_create_content_description()}
                </FieldDescription>
                {selectedChannels.length > 0 && (
                  <Tabs
                    value={activeChannel}
                    onValueChange={(value) => setActiveChannel(value as NotificationChannel)}
                  >
                    <TabsList variant='segmented' className='grid w-full grid-cols-3'>
                      {selectedChannels.map((channel) => (
                        <TabsTrigger key={channel} value={channel}>
                          {getChannelLabel(channel)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {selectedChannels.map((channel) => {
                      const contentErrors = errors.contents?.[channel]
                      const recipientTypes = optionsQuery.data.recipientTypes.filter((type) =>
                        type.supportedChannels.includes(channel),
                      )
                      return (
                        <TabsContent key={channel} value={channel}>
                          <Card size='sm'>
                            <CardHeader>
                              <CardTitle>{getChannelContentTitle(channel)}</CardTitle>
                              <CardDescription>
                                {m.notification_template_create_recipient_title()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <FieldGroup>
                                <FieldGroup className='grid md:grid-cols-[minmax(220px,0.6fr)_minmax(0,1.4fr)]'>
                                  <Controller
                                    name={`contents.${channel}.recipientTypeId`}
                                    control={control}
                                    render={({ field }) => (
                                      <Field data-invalid={!!contentErrors?.recipientTypeId}>
                                        <FieldLabel htmlFor={`recipient-type-${channel}`}>
                                          {m.notification_template_create_recipient_type_label()}
                                        </FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                          <SelectTrigger
                                            id={`recipient-type-${channel}`}
                                            className='w-full'
                                            aria-invalid={!!contentErrors?.recipientTypeId}
                                          >
                                            <SelectValue
                                              placeholder={m.notification_template_create_recipient_type_placeholder()}
                                            />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectGroup>
                                              {recipientTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                  {type.name}
                                                </SelectItem>
                                              ))}
                                            </SelectGroup>
                                          </SelectContent>
                                        </Select>
                                        <FieldError
                                          errors={
                                            contentErrors?.recipientTypeId
                                              ? [contentErrors.recipientTypeId]
                                              : undefined
                                          }
                                        />
                                      </Field>
                                    )}
                                  />

                                  <Field data-invalid={!!contentErrors?.recipient}>
                                    <FieldLabel htmlFor={`recipient-${channel}`}>
                                      {getRecipientLabel(channel)}
                                    </FieldLabel>
                                    <Input
                                      id={`recipient-${channel}`}
                                      placeholder={m.notification_template_create_recipient_placeholder()}
                                      aria-invalid={!!contentErrors?.recipient}
                                      {...register(`contents.${channel}.recipient`)}
                                    />
                                    <FieldDescription>
                                      {m.notification_template_create_recipient_description()}
                                    </FieldDescription>
                                    <FieldError
                                      errors={
                                        contentErrors?.recipient
                                          ? [contentErrors.recipient]
                                          : undefined
                                      }
                                    />
                                  </Field>
                                </FieldGroup>

                                {channel !== 'WhatsApp' && (
                                  <Field data-invalid={!!contentErrors?.subject}>
                                    <FieldLabel htmlFor={`subject-${channel}`}>
                                      {m.notification_templates_subject_label()}
                                    </FieldLabel>
                                    <Input
                                      id={`subject-${channel}`}
                                      placeholder={m.notification_templates_subject_placeholder()}
                                      aria-invalid={!!contentErrors?.subject}
                                      {...register(`contents.${channel}.subject`)}
                                    />
                                    <FieldError
                                      errors={
                                        contentErrors?.subject ? [contentErrors.subject] : undefined
                                      }
                                    />
                                  </Field>
                                )}

                                <Field data-invalid={!!contentErrors?.messageBody}>
                                  <FieldLabel htmlFor={`message-${channel}`}>
                                    {m.notification_templates_message_label()}
                                  </FieldLabel>
                                  <Textarea
                                    id={`message-${channel}`}
                                    placeholder={m.notification_templates_message_placeholder()}
                                    aria-invalid={!!contentErrors?.messageBody}
                                    className='min-h-36 resize-y'
                                    {...register(`contents.${channel}.messageBody`)}
                                  />
                                  <FieldError
                                    errors={
                                      contentErrors?.messageBody
                                        ? [contentErrors.messageBody]
                                        : undefined
                                    }
                                  />
                                </Field>
                              </FieldGroup>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                )}
              </FieldSet>

              <Field>
                <FieldLabel>{m.notification_templates_variables_label()}</FieldLabel>
                <div className='flex flex-wrap gap-2'>
                  {optionsQuery.data.availableVariables.map((variable) => (
                    <Badge key={variable} variant='secondary'>
                      {variable}
                    </Badge>
                  ))}
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className='justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={selectedChannels.length === 0}
              onClick={() => setPreviewOpen(true)}
            >
              <IconEye data-icon='inline-start' />
              {m.notification_templates_preview_button()}
            </Button>
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending && <Spinner data-icon='inline-start' />}
              {m.notification_templates_save_button()}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <NotificationTemplatePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        name={previewName}
        triggerEventId={previewTriggerEventId}
        channels={selectedChannels}
        contents={previewContents}
        options={optionsQuery.data}
        isSaving={createMutation.isPending}
        onSave={() =>
          void handleSubmit(
            (values) => submitTemplate(values),
            () => setPreviewOpen(false),
          )()
        }
      />
    </AppMain>
  )
}
