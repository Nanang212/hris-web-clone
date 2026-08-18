import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconBrandWhatsapp,
  IconDeviceMobile,
  IconEye,
  IconMail,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
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
import { ScrollArea } from '@/shared/components/ui/scroll-area'
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
  useGetNotificationTemplateOptions,
  useGetNotificationTemplates,
  useUpdateNotificationTemplate,
} from '@/features/settings/notification/hooks'
import type {
  NotificationChannel,
  NotificationTemplate,
  NotificationTemplatePayload,
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

function getChannelIcon(channel: NotificationChannel) {
  const icons = {
    Email: IconMail,
    Push: IconDeviceMobile,
    WhatsApp: IconBrandWhatsapp,
  }
  return icons[channel]
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

function getTemplateStatusLabel(status: NotificationTemplateStatus) {
  const labels: Record<NotificationTemplateStatus, string> = {
    Active: m.notification_templates_status_active(),
    Draft: m.notification_templates_status_draft(),
    Inactive: m.notification_templates_status_inactive(),
  }
  return labels[status]
}

function getTemplateStatusVariant(status: NotificationTemplateStatus) {
  const variants = {
    Active: 'green',
    Draft: 'amber',
    Inactive: 'gray',
  } as const
  return variants[status]
}

function getTemplateValues(template: NotificationTemplate) {
  const contents = {
    Email: {
      recipientTypeId: '',
      recipient: '',
      subject: template.subject,
      messageBody: template.messageBody,
    },
    Push: {
      recipientTypeId: '',
      recipient: '',
      subject: template.subject,
      messageBody: template.messageBody,
    },
    WhatsApp: {
      recipientTypeId: '',
      recipient: '',
      subject: '',
      messageBody: template.messageBody,
    },
  }

  template.channelContents?.forEach((content) => {
    contents[content.channel] = {
      recipientTypeId: content.recipientTypeId,
      recipient: content.recipient,
      subject: content.subject ?? '',
      messageBody: content.messageBody,
    }
  })

  return {
    name: template.name,
    triggerEventId: template.triggerEventId ?? '',
    status: template.status,
    channels: template.channels,
    contents,
  }
}

export function NotificationTemplatesPage() {
  const templatesQuery = useGetNotificationTemplates()
  const optionsQuery = useGetNotificationTemplateOptions()
  const updateMutation = useUpdateNotificationTemplate()
  const [search, setSearch] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
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
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      triggerEventId: '',
      status: 'Draft',
      channels: [],
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
  const displayedActiveChannel = selectedChannels.includes(activeChannel)
    ? activeChannel
    : (selectedChannels[0] ?? 'Email')

  const templates = templatesQuery.data?.templates ?? []
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null

  useEffect(() => {
    if (selectedTemplate) {
      reset(getTemplateValues(selectedTemplate))
    }
  }, [reset, selectedTemplate])

  if (
    templatesQuery.isPending ||
    optionsQuery.isPending ||
    templatesQuery.error ||
    optionsQuery.error ||
    !templatesQuery.data ||
    !optionsQuery.data
  ) {
    const error = templatesQuery.error ?? optionsQuery.error
    return (
      <AppMain
        pending={templatesQuery.isPending || optionsQuery.isPending}
        error={error}
        retry={() => {
          void templatesQuery.refetch()
          void optionsQuery.refetch()
        }}
        notFound={!templatesQuery.data || !optionsQuery.data}
      />
    )
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(normalizedSearch),
  )

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setSelectedTemplateId(template.id)
    setActiveChannel(template.channels[0] ?? 'Email')
    reset(getTemplateValues(template))
  }

  const handleSave = (values: z.infer<typeof formSchema>) => {
    if (!selectedTemplate) {
      return
    }

    const payload: NotificationTemplatePayload = {
      name: values.name,
      triggerEventId: values.triggerEventId,
      status: values.status,
      channels: values.channels,
      channelContents: values.channels.map((channel) => ({
        channel,
        recipientTypeId: values.contents[channel].recipientTypeId,
        recipient: values.contents[channel].recipient,
        subject: channel === 'WhatsApp' ? undefined : values.contents[channel].subject,
        messageBody: values.contents[channel].messageBody,
      })),
    }

    updateMutation.mutate(
      { id: selectedTemplate.id, payload },
      {
        onSuccess: (response) => {
          setSelectedTemplateId(response.data.id)
          snackbar.success(m.notification_templates_update_success())
        },
        onError: (error) => snackbar.exception(error),
      },
    )
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/notification', label: m.notification_overview_title() },
        { label: m.notification_templates_title() },
      ]}
      backTo='/settings/notification'
      title={m.notification_templates_title()}
      subtitle={m.notification_templates_subtitle()}
      actions={
        <Button asChild>
          <Link to='/settings/notification/templates/create'>
            <IconPlus data-icon='inline-start' />
            {m.notification_templates_new_button()}
          </Link>
        </Button>
      }
    >
      <div className='grid items-stretch gap-4 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.5fr)]'>
        <div className='relative min-h-0'>
          <Card className='min-h-0 gap-0 overflow-hidden py-0 lg:absolute lg:inset-x-0 lg:top-0 lg:max-h-full'>
            <CardHeader className='gap-3 p-5'>
              <CardTitle>{m.notification_templates_list_title()}</CardTitle>
              <div className='relative'>
                <IconSearch className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={m.notification_templates_search_placeholder()}
                  aria-label={m.notification_templates_search_label()}
                  className='pl-9'
                />
              </div>
            </CardHeader>
            <CardContent className='min-h-0 flex-1 px-3 pb-3'>
              <ScrollArea className='lg:h-full'>
                <div className='flex flex-col gap-2 pr-3'>
                  {filteredTemplates.map((template) => {
                    const Icon = getChannelIcon(template.channels[0] ?? 'Email')
                    const selected = selectedTemplate?.id === template.id
                    return (
                      <Button
                        key={template.id}
                        type='button'
                        variant={selected ? 'secondary' : 'ghost'}
                        className='h-auto w-full justify-start rounded-xl p-3 text-left'
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <Icon data-icon='inline-start' />
                        <span className='flex min-w-0 flex-1 flex-col items-start gap-1'>
                          <span className='max-w-full truncate font-semibold'>{template.name}</span>
                          <span className='max-w-full truncate text-xs font-normal'>
                            {template.channels.map(getChannelLabel).join(' + ')}
                          </span>
                        </span>
                        <Badge variant={getTemplateStatusVariant(template.status)}>
                          {getTemplateStatusLabel(template.status)}
                        </Badge>
                      </Button>
                    )
                  })}
                  {filteredTemplates.length === 0 && (
                    <CardDescription className='p-4 text-center'>
                      {m.notification_templates_no_results()}
                    </CardDescription>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {selectedTemplate ? (
          <Card className='gap-0 py-0'>
            <form onSubmit={handleSubmit(handleSave)} noValidate>
              <CardHeader className='flex flex-row items-center justify-between gap-3 border-b p-5'>
                <CardTitle>
                  {m.notification_templates_edit_title({ name: selectedTemplate.name })}
                </CardTitle>
                <Badge variant={getTemplateStatusVariant(selectedTemplate.status)}>
                  {getTemplateStatusLabel(selectedTemplate.status)}
                </Badge>
              </CardHeader>
              <CardContent className='p-5'>
                <FieldGroup>
                  <FieldGroup className='grid md:grid-cols-3'>
                    <Field data-invalid={!!errors.name}>
                      <FieldLabel htmlFor='edit-template-name'>
                        {m.notification_templates_name_label()}
                      </FieldLabel>
                      <Input
                        id='edit-template-name'
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
                          <FieldLabel htmlFor='edit-template-trigger'>
                            {m.notification_template_create_trigger_label()}
                          </FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id='edit-template-trigger'
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
                          <FieldLabel htmlFor='edit-template-status'>
                            {m.notification_template_create_status_label()}
                          </FieldLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger
                              id='edit-template-status'
                              className='w-full'
                              aria-invalid={!!errors.status}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {getTemplateStatusLabel(status)}
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
                              const id = `edit-template-channel-${channel.toLowerCase()}`
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
                        value={displayedActiveChannel}
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
                                            <FieldLabel htmlFor={`edit-recipient-type-${channel}`}>
                                              {m.notification_template_create_recipient_type_label()}
                                            </FieldLabel>
                                            <Select
                                              value={field.value}
                                              onValueChange={field.onChange}
                                            >
                                              <SelectTrigger
                                                id={`edit-recipient-type-${channel}`}
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
                                        <FieldLabel htmlFor={`edit-recipient-${channel}`}>
                                          {getRecipientLabel(channel)}
                                        </FieldLabel>
                                        <Input
                                          id={`edit-recipient-${channel}`}
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
                                        <FieldLabel htmlFor={`edit-subject-${channel}`}>
                                          {m.notification_templates_subject_label()}
                                        </FieldLabel>
                                        <Input
                                          id={`edit-subject-${channel}`}
                                          placeholder={m.notification_templates_subject_placeholder()}
                                          aria-invalid={!!contentErrors?.subject}
                                          {...register(`contents.${channel}.subject`)}
                                        />
                                        <FieldError
                                          errors={
                                            contentErrors?.subject
                                              ? [contentErrors.subject]
                                              : undefined
                                          }
                                        />
                                      </Field>
                                    )}

                                    <Field data-invalid={!!contentErrors?.messageBody}>
                                      <FieldLabel htmlFor={`edit-message-${channel}`}>
                                        {m.notification_templates_message_label()}
                                      </FieldLabel>
                                      <Textarea
                                        id={`edit-message-${channel}`}
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
              <CardFooter className='justify-end gap-2 border-t p-5'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={selectedChannels.length === 0}
                  onClick={() => setPreviewOpen(true)}
                >
                  <IconEye data-icon='inline-start' />
                  {m.notification_templates_preview_button()}
                </Button>
                <Button type='submit' disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Spinner data-icon='inline-start' />}
                  {m.notification_templates_save_button()}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{m.notification_templates_list_title()}</CardTitle>
              <CardDescription>{m.notification_templates_no_results()}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <NotificationTemplatePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        name={previewName}
        triggerEventId={previewTriggerEventId}
        channels={selectedChannels}
        contents={previewContents}
        options={optionsQuery.data}
        isSaving={updateMutation.isPending}
        onSave={() =>
          void handleSubmit(
            (values) => handleSave(values),
            () => setPreviewOpen(false),
          )()
        }
      />
    </AppMain>
  )
}
