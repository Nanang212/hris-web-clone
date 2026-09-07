import {
  IconBriefcase,
  IconBuilding,
  IconChevronLeft,
  IconDots,
  IconDownload,
  IconFileText,
  IconId,
  IconInfoCircle,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconShieldCheck,
  IconUser,
  IconWallet,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Spinner } from '@/shared/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { snackbar } from '@/shared/lib/snackbar'
import { EmployeeBpjsTab } from '@/features/company/employee-information/components/employee-bpjs-tab'
import { EmployeeMcuTab } from '@/features/company/employee-information/components/employee-mcu-tab'
import { EmployeeInformationEditSheet } from '@/features/company/employee-information/components/employee-information-edit-sheet'
import {
  useDownloadEmployeeProfile,
  useGetEmployeeInformationDetail,
} from '@/features/company/employee-information/hooks'
import type {
  EmployeeInformationDocumentDetail,
  EmployeeInformationEmploymentType,
  EmployeeInformationStatus,
} from '@/features/company/employee-information/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeInformationDetailPageProps {
  employeeId: string
}

interface DetailRowProps {
  label: string
  value?: string | null
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getStatusLabel(status: EmployeeInformationStatus) {
  return {
    Active: m.employee_information_status_active(),
    OnLeave: m.employee_information_status_on_leave(),
    Probation: m.employee_information_status_probation(),
    Resigned: m.employee_information_status_resigned(),
    Inactive: m.employee_information_status_inactive(),
  }[status]
}

function getStatusVariant(status: EmployeeInformationStatus) {
  return {
    Active: 'green',
    OnLeave: 'blue',
    Probation: 'amber',
    Resigned: 'slate',
    Inactive: 'red',
  }[status] as 'green' | 'blue' | 'amber' | 'slate' | 'red'
}

function getEmploymentTypeLabel(type: EmployeeInformationEmploymentType) {
  return {
    Permanent: m.employee_information_type_permanent(),
    Contract: m.employee_information_type_contract(),
    Internship: m.employee_information_type_internship(),
    Freelance: m.employee_information_type_freelance(),
  }[type]
}

function formatDate(value?: string | null) {
  return value ? dayjs(value).format('DD MMM YYYY') : null
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

function formatFileSize(value?: number | null) {
  if (!value) return null
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function getBankVerificationLabel(status?: 'Verified' | 'Pending' | 'Failed' | null) {
  if (status === 'Verified') return m.employee_information_detail_bank_verification_verified()
  if (status === 'Failed') return m.employee_information_detail_bank_verification_failed()
  return m.employee_information_detail_bank_verification_pending()
}

function getBankVerificationVariant(status?: 'Verified' | 'Pending' | 'Failed' | null) {
  if (status === 'Verified') return 'green'
  if (status === 'Failed') return 'red'
  return 'amber'
}

function DetailRow({ label, value }: Readonly<DetailRowProps>) {
  return (
    <div className='grid min-w-0 gap-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-3'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 text-xs font-medium wrap-break-word'>
        {value || m.employee_information_detail_not_available()}
      </dd>
    </div>
  )
}

function DetailCard({
  title,
  description,
  icon: Icon,
  children,
}: Readonly<{
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}>) {
  return (
    <Card className='min-w-0'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Icon className='size-4' />
          </span>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <dl className='flex flex-col gap-3'>{children}</dl>
      </CardContent>
    </Card>
  )
}

function DocumentCard({
  title,
  document,
}: Readonly<{
  title: string
  document?: EmployeeInformationDocumentDetail | null
}>) {
  return (
    <Card className='min-w-0'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <span className='flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <IconFileText className='size-4' />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>
            {document?.fileName || m.employee_information_detail_not_available()}
          </p>
          {document?.fileSize && (
            <p className='mt-1 text-xs text-muted-foreground'>
              {formatFileSize(document.fileSize)}
            </p>
          )}
        </div>
        {document?.url && (
          <Button asChild size='sm' variant='outline' className='shrink-0'>
            <a href={document.url} download={document.fileName ?? undefined}>
              <IconDownload data-icon='inline-start' />
              {m.employee_information_detail_document_download()}
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function InformationNotice({ title, description }: Readonly<{ title: string; description: string }>) {
  return (
    <Card className='border-primary/20 bg-primary/5'>
      <CardContent className='flex gap-3'>
        <IconInfoCircle className='mt-0.5 size-4 shrink-0 text-primary' />
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-primary'>{title}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function EmployeeInformationDetailPage({
  employeeId,
}: Readonly<EmployeeInformationDetailPageProps>) {
  const [editOpen, setEditOpen] = useState(false)
  const detailQuery = useGetEmployeeInformationDetail(employeeId)
  const downloadMutation = useDownloadEmployeeProfile()

  if (detailQuery.isPending || detailQuery.error || !detailQuery.data) {
    return (
      <AppMain
        pending={detailQuery.isPending}
        error={detailQuery.error}
        retry={() => void detailQuery.refetch()}
        notFound={!detailQuery.data}
      />
    )
  }

  const employee = detailQuery.data
  const personal = employee.personalInformation
  const employment = employee.employmentInformation
  const emergency = employee.emergencyContact
  const financial = employee.financialAndCompliance
  const medical = employee.medicalCheckup
  const statusManagement = employee.statusManagement
  const statusHistory = employee.statusHistory ?? []

  const downloadProfile = () => {
    downloadMutation.mutate(employee.id, {
      onSuccess: (blob) => {
        saveBlob(blob, `${employee.employeeNumber}-profile.pdf`)
        snackbar.success(m.employee_information_print_success())
      },
      onError: (error) => snackbar.exception(error),
    })
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/company/employee-info', label: m.app_layout_nav_employee_information() },
        { label: m.employee_information_detail_breadcrumb() },
      ]}
      backTo='/company/employee-info'
      title={m.employee_information_detail_title()}
      subtitle={m.employee_information_detail_subtitle()}
      actions={
        <div className='flex flex-wrap items-center gap-2'>
          <Button size='sm' onClick={() => setEditOpen(true)}>
            <IconPencil data-icon='inline-start' />
            {m.employee_information_detail_edit()}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='outline'>
                <IconDots data-icon='inline-start' />
                {m.employee_information_detail_more_actions()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={downloadProfile} disabled={downloadMutation.isPending}>
                {downloadMutation.isPending ? <Spinner /> : <IconDownload />}
                {m.employee_information_detail_download()}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to='/company/employee-info'>
                  <IconChevronLeft />
                  {m.employee_information_detail_back()}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <Card>
        <CardContent className='grid min-w-0 gap-5 sm:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center'>
          <Avatar className='size-20 sm:size-24'>
            <AvatarImage src={employee.avatarUrl ?? undefined} alt={employee.fullName} />
            <AvatarFallback className='bg-primary/10 text-xl font-bold text-primary sm:text-2xl'>
              {getInitials(employee.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='truncate text-xl font-bold'>{employee.fullName}</h2>
              <Badge variant={getStatusVariant(employee.status)}>
                {getStatusLabel(employee.status)}
              </Badge>
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>{employee.positionName}</p>
            <p className='mt-2 text-xs text-muted-foreground'>
              {employee.departmentName} · {employee.divisionName}
            </p>
            <div className='mt-3 flex flex-wrap gap-2'>
              <Badge variant='blue'>{employee.employeeNumber}</Badge>
              <Badge variant='outline'>
                {m.employee_information_detail_joined({
                  date: formatDate(employee.joinDate) ?? '',
                })}
              </Badge>
              {employee.gradeName && <Badge variant='green'>{employee.gradeName}</Badge>}
              {medical.dueDate && (
                <Badge variant='green'>
                  {medical.status} ·{' '}
                  {m.employee_information_detail_mcu_due({
                    date: formatDate(medical.dueDate) ?? '',
                  })}
                </Badge>
              )}
            </div>
          </div>

          <div className='flex min-w-0 flex-col gap-2 text-xs text-muted-foreground sm:col-span-2 xl:col-span-1'>
            <span className='flex min-w-0 items-center gap-2'>
              <IconMail className='size-4 shrink-0' />
              <span className='truncate'>{employee.email}</span>
            </span>
            <span className='flex items-center gap-2'>
              <IconPhone className='size-4 shrink-0' />
              {employee.phoneNumber || m.employee_information_detail_not_available()}
            </span>
            <span className='flex items-center gap-2'>
              <IconMapPin className='size-4 shrink-0' />
              {employee.address || employee.branchName}
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='personal' className='min-w-0'>
        <TabsList
          variant='line'
          className='no-scrollbar w-full justify-start overflow-x-auto border-b'
        >
          <TabsTrigger value='personal'>{m.employee_information_detail_tab_personal()}</TabsTrigger>
          <TabsTrigger value='employment'>
            {m.employee_information_detail_tab_employment()}
          </TabsTrigger>
          <TabsTrigger value='status'>{m.employee_information_detail_tab_status()}</TabsTrigger>
          <TabsTrigger value='photo'>{m.employee_information_detail_tab_photo()}</TabsTrigger>
          <TabsTrigger value='bank'>{m.employee_information_detail_tab_bank()}</TabsTrigger>
          <TabsTrigger value='npwp'>{m.employee_information_detail_tab_npwp()}</TabsTrigger>
          <TabsTrigger value='mcu'>{m.employee_information_detail_tab_mcu()}</TabsTrigger>
          <TabsTrigger value='bpjs'>
            {m.employee_information_detail_tab_bpjs ? m.employee_information_detail_tab_bpjs() : 'BPJS'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='personal'>
          <div className='grid min-w-0 gap-4 xl:grid-cols-2'>
            <DetailCard title={m.employee_information_detail_personal_title()} icon={IconUser}>
              <DetailRow
                label={m.employee_information_detail_field_full_name()}
                value={personal.fullName}
              />
              <DetailRow
                label={m.employee_information_detail_field_email()}
                value={personal.email}
              />
              <DetailRow
                label={m.employee_information_detail_field_phone()}
                value={personal.phoneNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_birth_date()}
                value={formatDate(personal.birthDate)}
              />
              <DetailRow
                label={m.employee_information_detail_field_gender()}
                value={personal.gender}
              />
              <DetailRow
                label={m.employee_information_detail_field_marital_status()}
                value={personal.maritalStatus}
              />
              <DetailRow
                label={m.employee_information_detail_field_nationality()}
                value={personal.nationality}
              />
              <DetailRow
                label={m.employee_information_detail_field_address()}
                value={personal.address}
              />
            </DetailCard>

            <DetailCard
              title={m.employee_information_detail_employment_title()}
              icon={IconBriefcase}
            >
              <DetailRow
                label={m.employee_information_detail_field_employee_id()}
                value={employment.employeeNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_join_date()}
                value={formatDate(employment.joinDate)}
              />
              <DetailRow
                label={m.employee_information_detail_field_employment_type()}
                value={getEmploymentTypeLabel(employment.employmentType)}
              />
              <DetailRow
                label={m.employee_information_detail_field_department()}
                value={employment.departmentName}
              />
              <DetailRow
                label={m.employee_information_detail_field_division()}
                value={employment.divisionName}
              />
              <DetailRow
                label={m.employee_information_detail_field_position()}
                value={employment.positionName}
              />
              <DetailRow
                label={m.employee_information_detail_field_grade()}
                value={employment.gradeName}
              />
              <DetailRow
                label={m.employee_information_detail_field_work_location()}
                value={employment.workLocation}
              />
              <DetailRow
                label={m.employee_information_detail_field_supervisor()}
                value={employment.supervisorName}
              />
            </DetailCard>

            <DetailCard title={m.employee_information_detail_emergency_title()} icon={IconPhone}>
              <DetailRow
                label={m.employee_information_detail_field_contact_name()}
                value={emergency.name}
              />
              <DetailRow
                label={m.employee_information_detail_field_relationship()}
                value={emergency.relationship}
              />
              <DetailRow
                label={m.employee_information_detail_field_phone()}
                value={emergency.phoneNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_address()}
                value={emergency.address}
              />
            </DetailCard>

            <DetailCard
              title={m.employee_information_detail_financial_title()}
              icon={IconShieldCheck}
            >
              <DetailRow
                label={m.employee_information_detail_field_bank_holder()}
                value={financial.bankAccountHolder}
              />
              <DetailRow
                label={m.employee_information_detail_field_bank_name()}
                value={financial.bankName}
              />
              <DetailRow
                label={m.employee_information_detail_field_bank_number()}
                value={financial.bankAccountNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_npwp_number()}
                value={financial.npwpNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_npwp_status()}
                value={financial.npwpStatus}
              />
              <DetailRow
                label={m.employee_information_detail_field_bpjs_health()}
                value={financial.bpjsHealthNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_bpjs_employment()}
                value={financial.bpjsEmploymentNumber}
              />
            </DetailCard>
          </div>
        </TabsContent>

        <TabsContent value='employment'>
          <DetailCard title={m.employee_information_detail_employment_title()} icon={IconBuilding}>
            <DetailRow
              label={m.employee_information_detail_field_employee_id()}
              value={employment.employeeNumber}
            />
            <DetailRow
              label={m.employee_information_detail_field_join_date()}
              value={formatDate(employment.joinDate)}
            />
            <DetailRow
              label={m.employee_information_detail_field_employment_type()}
              value={getEmploymentTypeLabel(employment.employmentType)}
            />
            <DetailRow
              label={m.employee_information_detail_field_department()}
              value={employment.departmentName}
            />
            <DetailRow
              label={m.employee_information_detail_field_division()}
              value={employment.divisionName}
            />
            <DetailRow
              label={m.employee_information_detail_field_position()}
              value={employment.positionName}
            />
            <DetailRow
              label={m.employee_information_detail_field_grade()}
              value={employment.gradeName}
            />
            <DetailRow
              label={m.employee_information_detail_field_work_location()}
              value={employment.workLocation}
            />
            <DetailRow
              label={m.employee_information_detail_field_supervisor()}
              value={employment.supervisorName}
            />
          </DetailCard>
        </TabsContent>

        <TabsContent value='status'>
          <div className='grid min-w-0 gap-4 xl:grid-cols-2'>
            <DetailCard
              title={m.employee_information_detail_status_title()}
              description={m.employee_information_detail_status_description()}
              icon={IconShieldCheck}
            >
              <DetailRow
                label={m.employee_information_detail_field_status()}
                value={getStatusLabel(employee.status)}
              />
              <DetailRow
                label={m.employee_information_detail_field_employment_type()}
                value={getEmploymentTypeLabel(employee.employmentType)}
              />
              <DetailRow
                label={m.employee_information_detail_field_effective_date()}
                value={formatDate(statusManagement?.effectiveDate)}
              />
              <DetailRow
                label={m.employee_information_detail_field_reason()}
                value={statusManagement?.reason}
              />
              <DetailRow
                label={m.employee_information_detail_field_last_working_date()}
                value={formatDate(statusManagement?.lastWorkingDate)}
              />
              <DetailRow
                label={m.employee_information_detail_field_notes()}
                value={statusManagement?.notes}
              />
            </DetailCard>

            <Card className='min-w-0'>
              <CardHeader>
                <CardTitle>{m.employee_information_detail_status_history_title()}</CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col gap-3'>
                {statusHistory.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    {m.employee_information_detail_status_history_empty()}
                  </p>
                ) : (
                  statusHistory.map((history) => (
                    <div
                      key={history.id}
                      className='flex min-w-0 flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between'
                    >
                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <Badge variant={getStatusVariant(history.status)}>
                            {getStatusLabel(history.status)}
                          </Badge>
                          <span className='text-xs font-medium'>
                            {getEmploymentTypeLabel(history.employmentType)}
                          </span>
                        </div>
                        <p className='mt-2 text-xs text-muted-foreground wrap-break-word'>
                          {history.reason || m.employee_information_detail_not_available()}
                        </p>
                      </div>
                      <time className='shrink-0 text-xs text-muted-foreground'>
                        {formatDate(history.effectiveDate)}
                      </time>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='photo'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPhoto className='size-5 text-primary' />
                {m.employee_information_detail_photo_title()}
              </CardTitle>
              <CardDescription>{m.employee_information_detail_photo_description()}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center gap-5 py-6'>
              <div className='flex flex-col items-center gap-3'>
                <Avatar className='size-40 sm:size-48'>
                  <AvatarImage src={employee.avatarUrl ?? undefined} alt={employee.fullName} />
                  <AvatarFallback className='bg-primary/10 text-4xl font-bold text-primary'>
                    {getInitials(employee.fullName)}
                  </AvatarFallback>
                </Avatar>
                <Badge variant='green'>{m.employee_information_edit_photo_current_badge()}</Badge>
              </div>
              <div className='w-full max-w-2xl'>
                <InformationNotice
                  title={m.employee_information_detail_photo_usage_title()}
                  description={m.employee_information_detail_photo_usage_description()}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='bank'>
          <div className='grid min-w-0 gap-4 xl:grid-cols-2'>
            <DetailCard
              title={m.employee_information_detail_bank_title()}
              description={m.employee_information_detail_bank_description()}
              icon={IconWallet}
            >
              <DetailRow
                label={m.employee_information_detail_field_bank_holder()}
                value={financial.bankAccountHolder}
              />
              <DetailRow
                label={m.employee_information_detail_field_bank_name()}
                value={financial.bankName}
              />
              <DetailRow
                label={m.employee_information_detail_field_bank_number()}
                value={financial.bankAccountNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_bank_branch()}
                value={financial.bankBranch}
              />
              <DetailRow
                label={m.employee_information_detail_field_bank_account_type()}
                value={financial.bankAccountType}
              />
              <DetailRow
                label={m.employee_information_detail_field_currency()}
                value={financial.currency}
              />
              <DetailRow
                label={m.employee_information_detail_field_effective_date()}
                value={formatDate(financial.bankEffectiveDate)}
              />
              <DetailRow
                label={m.employee_information_detail_field_payroll_account()}
                value={
                  financial.payrollAccount == null
                    ? null
                    : financial.payrollAccount
                      ? m.employee_information_detail_yes()
                      : m.employee_information_detail_no()
                }
              />
            </DetailCard>

            <div className='flex min-w-0 flex-col gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle>{m.employee_information_detail_bank_verification_title()}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <Badge
                      variant={getBankVerificationVariant(financial.bankVerification?.status)}
                    >
                      {getBankVerificationLabel(financial.bankVerification?.status)}
                    </Badge>
                    {financial.bankVerification?.verifiedAt && (
                      <p className='mt-2 text-xs text-muted-foreground'>
                        {m.employee_information_detail_bank_verified_at({
                          date: formatDate(financial.bankVerification.verifiedAt) ?? '',
                        })}
                      </p>
                    )}
                  </div>
                  <Badge variant={financial.bankVerification?.payrollMappingActive ? 'green' : 'slate'}>
                    {m.employee_information_detail_field_payroll_account()}: {' '}
                    {financial.bankVerification?.payrollMappingActive
                      ? m.employee_information_detail_yes()
                      : m.employee_information_detail_no()}
                  </Badge>
                </CardContent>
              </Card>
              <InformationNotice
                title={m.employee_information_edit_sensitive_title()}
                description={m.employee_information_detail_bank_sensitive_description()}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='npwp'>
          <div className='grid min-w-0 gap-4 xl:grid-cols-2'>
            <DetailCard
              title={m.employee_information_detail_npwp_title()}
              description={m.employee_information_detail_npwp_description()}
              icon={IconId}
            >
              <DetailRow
                label={m.employee_information_detail_field_npwp_number()}
                value={financial.npwpNumber}
              />
              <DetailRow
                label={m.employee_information_detail_field_registered_name()}
                value={financial.npwpRegisteredName}
              />
              <DetailRow
                label={m.employee_information_detail_field_npwp_status()}
                value={financial.npwpStatus}
              />
              <DetailRow
                label={m.employee_information_detail_field_tax_category()}
                value={financial.taxCategory}
              />
              <DetailRow
                label={m.employee_information_detail_field_effective_date()}
                value={formatDate(financial.npwpEffectiveDate)}
              />
              <DetailRow
                label={m.employee_information_detail_field_tax_office()}
                value={financial.taxOffice}
              />
            </DetailCard>
            <div className='flex min-w-0 flex-col gap-4'>
              <DocumentCard
                title={m.employee_information_detail_npwp_document_title()}
                document={financial.npwpDocument}
              />
              <InformationNotice
                title={m.employee_information_edit_sensitive_title()}
                description={m.employee_information_detail_npwp_sensitive_description()}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='mcu'>
          <EmployeeMcuTab
            employeeId={employee.id}
            employeeName={employee.fullName}
            employeeNumber={employee.employeeNumber}
            positionName={employee.positionName}
            branchName={employee.branchName}
            avatarUrl={employee.avatarUrl}
          />
        </TabsContent>

        <TabsContent value='bpjs'>
          <EmployeeBpjsTab
            employeeId={employee.id}
            defaultHealthNumber={financial.bpjsHealthNumber}
            defaultEmploymentNumber={financial.bpjsEmploymentNumber}
          />
        </TabsContent>
      </Tabs>
      <EmployeeInformationEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
      />
    </AppMain>
  )
}
