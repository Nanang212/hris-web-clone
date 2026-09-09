import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSchema } from '@/shared/lib/schema'
import { snackbar } from '@/shared/lib/snackbar'
import { m } from '@/i18n/paraglide/messages'

import { dummyClients } from '../data/dummy-clients'

interface ClientFormPageProps {
  clientId?: string
}

export function ClientFormPage({ clientId }: Readonly<ClientFormPageProps>) {
  const navigate = useNavigate()
  const client = clientId ? dummyClients.find((item) => item.id === clientId) : undefined
  const isEdit = Boolean(clientId)
  const formSchema = useSchema(() => ({
    code: z.string().min(1, { message: m.company_client_code_required() }),
    name: z.string().min(1, { message: m.company_client_name_required() }),
    address: z.string().optional(),
    contactPersonName: z.string().optional(),
    contactPersonEmail: z.union([z.email(), z.literal('')]).optional(),
    contactPersonPhone: z.string().optional(),
    isActive: z.boolean(),
  }))
  type FormValues = z.infer<typeof formSchema>
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: client?.code ?? '',
      name: client?.name ?? '',
      address: client?.address ?? '',
      contactPersonName: client?.contactPersonName ?? '',
      contactPersonEmail: client?.contactPersonEmail ?? '',
      contactPersonPhone: client?.contactPersonPhone ?? '',
      isActive: client?.isActive ?? true,
    },
  })

  if (isEdit && !client) return <AppMain notFound />

  const onSubmit = () => {
    snackbar.success(isEdit ? m.company_client_toast_updated() : m.company_client_toast_created())
    navigate({ to: '/company/client' })
  }

  return (
    <AppMain
      title={isEdit ? m.company_client_edit_title() : m.company_client_create_title()}
      subtitle={m.company_client_form_description()}
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_company() },
        { to: '/company/client', label: m.app_layout_nav_company_client() },
        {
          to: '.',
          label: isEdit ? m.company_client_edit_title() : m.company_client_create_title(),
        },
      ]}
      backTo='/company/client'
      className='w-full max-w-full min-w-0 gap-6'
    >
      <form className='w-full' onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardContent className='pt-6'>
            <FieldGroup className='grid gap-6 md:grid-cols-2'>
              <Field data-invalid={!!errors.code}>
                <FieldLabel htmlFor='client-code'>{m.company_client_code()}</FieldLabel>
                <Input id='client-code' aria-invalid={!!errors.code} {...register('code')} />
                <FieldError errors={errors.code ? [errors.code] : undefined} />
              </Field>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor='client-name'>{m.company_client_name()}</FieldLabel>
                <Input id='client-name' aria-invalid={!!errors.name} {...register('name')} />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>
              <Field className='md:col-span-2'>
                <FieldLabel htmlFor='client-address'>{m.company_client_address()}</FieldLabel>
                <Textarea id='client-address' {...register('address')} />
              </Field>
              <Field>
                <FieldLabel htmlFor='client-contact-name'>
                  {m.company_client_contact_name()}
                </FieldLabel>
                <Input id='client-contact-name' {...register('contactPersonName')} />
              </Field>
              <Field data-invalid={!!errors.contactPersonEmail}>
                <FieldLabel htmlFor='client-contact-email'>
                  {m.company_client_contact_email()}
                </FieldLabel>
                <Input
                  id='client-contact-email'
                  type='email'
                  aria-invalid={!!errors.contactPersonEmail}
                  {...register('contactPersonEmail')}
                />
                <FieldError
                  errors={errors.contactPersonEmail ? [errors.contactPersonEmail] : undefined}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor='client-contact-phone'>
                  {m.company_client_contact_phone()}
                </FieldLabel>
                <Input id='client-contact-phone' {...register('contactPersonPhone')} />
              </Field>
              <Field
                orientation='horizontal'
                className='items-center justify-between rounded-md border p-3'
              >
                <FieldLabel htmlFor='client-active'>{m.company_client_active()}</FieldLabel>
                <Controller
                  name='isActive'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id='client-active'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
        <div className='mt-7 flex justify-end gap-2'>
          <Button variant='outline' asChild>
            <Link to='/company/client'>{m.company_action_cancel()}</Link>
          </Button>
          <Button type='submit'>
            {isEdit ? m.company_action_save() : m.company_action_create()}
          </Button>
        </div>
      </form>
    </AppMain>
  )
}
