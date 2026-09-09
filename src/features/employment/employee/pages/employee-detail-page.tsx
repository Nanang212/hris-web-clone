// employee-detail-page.tsx — Employee detail with tabbed sections

import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCalendarStats,
  IconCoin,
  IconDownload,
  IconFileText,
  IconId,
  IconMail,
  IconPencil,
  IconPhone,
  IconUser,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'

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
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { EmployeeStatusBadge } from '@/features/employment/employee/components/employee-status-badge'
import {
  useGetEmployeeById,
  useGetEmployeeDocuments,
  useGetEmployeeEmploymentInfo,
  useGetEmployeeLeaveBalance,
  useGetEmployeePayrollInfo,
  useGetEmployeePersonalInfo,
} from '@/features/employment/employee/hooks'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeDetailPageProps {
  id: string
}

function InfoRow({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div className='flex flex-col gap-0.5'>
      <p className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
        {label}
      </p>
      <p className='text-sm font-medium text-foreground'>{value ?? '—'}</p>
    </div>
  )
}

function InfoGrid({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>{children}</div>
}

export function EmployeeDetailPage({ id }: Readonly<EmployeeDetailPageProps>) {
  const { data: employee, isPending, error } = useGetEmployeeById(id)
  const { data: personal } = useGetEmployeePersonalInfo(id)
  const { data: employment } = useGetEmployeeEmploymentInfo(id)
  const { data: documents } = useGetEmployeeDocuments(id)
  const { data: payroll } = useGetEmployeePayrollInfo(id)
  const { data: leaveBalance } = useGetEmployeeLeaveBalance(id)

  if (isPending || error || !employee) {
    return <AppMain pending={isPending} error={error} notFound={!employee && !isPending} />
  }

  const initials = employee.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Company' },
        { to: '/employment', label: m.employment_list_title() },
        { to: '.', label: employee.fullName },
      ]}
      title={employee.fullName}
      subtitle={`${employee.positionName} · ${employee.departmentName}`}
      backTo='/employment'
      actions={
        <Link to='/employment/employee/update' search={{ id: employee.id }}>
          <Button size='sm'>
            <IconPencil data-icon='inline-start' />
            {m.employment_detail_edit_button()}
          </Button>
        </Link>
      }
    >
      {/* Profile Header Card */}
      <Card className='mb-6 overflow-hidden'>
        <div className='h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent' />
        <CardContent className='-mt-12 flex flex-col gap-5 pb-6 sm:flex-row sm:items-end sm:gap-6'>
          <Avatar className='size-24 shadow-lg ring-4 ring-card'>
            <AvatarImage src={employee.photo ?? undefined} alt={employee.fullName} />
            <AvatarFallback className='bg-primary/15 text-2xl font-bold text-primary'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-col gap-1 sm:pb-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='text-xl font-bold text-foreground'>{employee.fullName}</h2>
              <EmployeeStatusBadge status={employee.status} />
            </div>
            <p className='text-sm text-muted-foreground'>{employee.positionName}</p>
            <div className='mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <IconBuilding size={13} />
                {employee.departmentName}
              </span>
              <span className='flex items-center gap-1.5'>
                <IconMail size={13} />
                {employee.email}
              </span>
              <span className='flex items-center gap-1.5'>
                <IconPhone size={13} />
                {employee.phone}
              </span>
            </div>
          </div>
          <div className='flex gap-2 pb-1'>
            <Badge variant='outline' className='text-xs'>
              {employee.employeeCode}
            </Badge>
            <Badge variant='secondary' className='text-xs'>
              {employee.gradeName}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue='personal'>
        <TabsList className='mb-4 flex w-full overflow-x-auto sm:w-auto'>
          <TabsTrigger value='personal' className='flex items-center gap-1.5'>
            <IconUser size={14} />
            {m.employment_detail_tab_personal()}
          </TabsTrigger>
          <TabsTrigger value='employment' className='flex items-center gap-1.5'>
            <IconBriefcase size={14} />
            {m.employment_detail_tab_employment()}
          </TabsTrigger>
          <TabsTrigger value='documents' className='flex items-center gap-1.5'>
            <IconFileText size={14} />
            {m.employment_detail_tab_documents()}
          </TabsTrigger>
          <TabsTrigger value='payroll' className='flex items-center gap-1.5'>
            <IconCoin size={14} />
            {m.employment_detail_tab_payroll()}
          </TabsTrigger>
          <TabsTrigger value='leave' className='flex items-center gap-1.5'>
            <IconCalendarStats size={14} />
            {m.employment_detail_tab_leave_balance()}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info */}
        <TabsContent value='personal'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconId size={18} className='text-primary' />
                Informasi Personal
              </CardTitle>
              <CardDescription>Data diri dan kontak darurat karyawan</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              {personal ? (
                <>
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Data Diri
                    </h4>
                    <InfoGrid>
                      <InfoRow label='NIK' value={personal.nik} />
                      <InfoRow label='Tempat Lahir' value={personal.birthPlace} />
                      <InfoRow
                        label='Tanggal Lahir'
                        value={
                          personal.birthDate
                            ? dayjs(personal.birthDate).format('DD MMMM YYYY')
                            : null
                        }
                      />
                      <InfoRow
                        label='Jenis Kelamin'
                        value={personal.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                      />
                      <InfoRow
                        label='Status Pernikahan'
                        value={
                          {
                            single: 'Belum Menikah',
                            married: 'Menikah',
                            divorced: 'Cerai',
                            widowed: 'Janda/Duda',
                          }[personal.maritalStatus]
                        }
                      />
                      <InfoRow label='Agama' value={personal.religion} />
                      <InfoRow label='Golongan Darah' value={personal.bloodType} />
                    </InfoGrid>
                  </div>
                  <Separator />
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Alamat
                    </h4>
                    <InfoGrid>
                      <InfoRow label='Alamat' value={personal.address} />
                      <InfoRow label='Kota' value={personal.city} />
                      <InfoRow label='Provinsi' value={personal.province} />
                      <InfoRow label='Kode Pos' value={personal.postalCode} />
                    </InfoGrid>
                  </div>
                  <Separator />
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Kontak Darurat
                    </h4>
                    <InfoGrid>
                      <InfoRow label='Nama' value={personal.emergencyContactName} />
                      <InfoRow label='Hubungan' value={personal.emergencyContactRelation} />
                      <InfoRow label='No. Telepon' value={personal.emergencyContactPhone} />
                    </InfoGrid>
                  </div>
                </>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  Data personal belum tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Employment Info */}
        <TabsContent value='employment'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconBriefcase size={18} className='text-primary' />
                Informasi Kepegawaian
              </CardTitle>
              <CardDescription>Detail kontrak, shift, dan penempatan kerja</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              {employment ? (
                <>
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Kontrak Kerja
                    </h4>
                    <InfoGrid>
                      <InfoRow
                        label='Tipe Kontrak'
                        value={
                          {
                            permanent: 'Karyawan Tetap',
                            contract: 'Kontrak',
                            internship: 'Magang',
                            freelance: 'Freelance',
                          }[employment.contractType]
                        }
                      />
                      <InfoRow
                        label='Tanggal Mulai'
                        value={
                          employment.contractStart
                            ? dayjs(employment.contractStart).format('DD MMMM YYYY')
                            : null
                        }
                      />
                      <InfoRow
                        label='Tanggal Selesai'
                        value={
                          employment.contractEnd
                            ? dayjs(employment.contractEnd).format('DD MMMM YYYY')
                            : 'Tidak ada batas'
                        }
                      />
                    </InfoGrid>
                  </div>
                  <Separator />
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Penempatan
                    </h4>
                    <InfoGrid>
                      <InfoRow label='Shift Kerja' value={employment.shiftName} />
                      <InfoRow label='Lokasi Kerja' value={employment.workLocation} />
                      <InfoRow label='Atasan Langsung' value={employment.managerName} />
                    </InfoGrid>
                  </div>
                  <Separator />
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Data Administratif
                    </h4>
                    <InfoGrid>
                      <InfoRow
                        label='No. BPJS Ketenagakerjaan'
                        value={employment.bpjsKetenagakerjaanNo}
                      />
                      <InfoRow label='No. BPJS Kesehatan' value={employment.bpjsKesehatanNo} />
                      <InfoRow label='NPWP' value={employment.npwp} />
                      <InfoRow label='Status Pajak (PTKP)' value={employment.taxStatus} />
                    </InfoGrid>
                  </div>
                </>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  Data kepegawaian belum tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value='documents'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconFileText size={18} className='text-primary' />
                Dokumen Karyawan
              </CardTitle>
              <CardDescription>Daftar dokumen yang diunggah untuk karyawan ini</CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className='flex flex-col gap-2'>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='flex size-9 items-center justify-center rounded-lg bg-primary/10'>
                          <IconFileText size={16} className='text-primary' />
                        </div>
                        <div>
                          <p className='text-sm font-medium text-foreground'>{doc.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {doc.type} · {dayjs(doc.uploadedAt).format('DD MMM YYYY')}
                          </p>
                        </div>
                      </div>
                      <Button variant='ghost' size='sm' asChild>
                        <a href={doc.fileUrl} target='_blank' rel='noopener noreferrer'>
                          <IconDownload size={14} data-icon='inline-start' />
                          Unduh
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  Belum ada dokumen yang diunggah.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Payroll */}
        <TabsContent value='payroll'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconCoin size={18} className='text-primary' />
                Informasi Payroll
              </CardTitle>
              <CardDescription>Data rekening, pajak, dan komponen gaji</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              {payroll ? (
                <>
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Rekening Bank
                    </h4>
                    <InfoGrid>
                      <InfoRow label='Bank' value={payroll.bankName} />
                      <InfoRow label='No. Rekening' value={payroll.accountNumber} />
                      <InfoRow label='Nama Pemilik Rekening' value={payroll.accountHolderName} />
                    </InfoGrid>
                  </div>
                  <Separator />
                  <div>
                    <h4 className='mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase'>
                      Komponen Gaji
                    </h4>
                    <div className='overflow-hidden rounded-xl border border-border'>
                      <div className='flex items-center justify-between bg-muted/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground'>
                        <span>Komponen</span>
                        <span>Jumlah</span>
                      </div>
                      {payroll.components.map((comp) => (
                        <div
                          key={comp.componentId}
                          className='flex items-center justify-between border-t border-border px-4 py-3'
                        >
                          <div>
                            <p className='text-sm font-medium text-foreground'>
                              {comp.componentName}
                            </p>
                            <Badge
                              variant={comp.componentType === 'earning' ? 'green' : 'red'}
                              className='mt-0.5 text-[10px]'
                            >
                              {comp.componentType === 'earning' ? 'Pendapatan' : 'Potongan'}
                            </Badge>
                          </div>
                          <p
                            className={`text-sm font-semibold ${comp.componentType === 'earning' ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            {comp.componentType === 'deduction' ? '- ' : '+ '}
                            Rp {comp.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))}
                      <div className='flex items-center justify-between border-t-2 border-border bg-muted/40 px-4 py-3'>
                        <p className='text-sm font-bold text-foreground'>Total Take Home Pay</p>
                        <p className='text-sm font-extrabold text-primary'>
                          Rp{' '}
                          {payroll.components
                            .reduce(
                              (sum, c) =>
                                c.componentType === 'earning' ? sum + c.amount : sum - c.amount,
                              payroll.basicSalary,
                            )
                            .toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  Data payroll belum tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Leave Balance */}
        <TabsContent value='leave'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconCalendar size={18} className='text-primary' />
                Saldo Cuti
              </CardTitle>
              <CardDescription>Sisa jatah cuti karyawan per jenis cuti</CardDescription>
            </CardHeader>
            <CardContent>
              {leaveBalance && leaveBalance.length > 0 ? (
                <div className='flex flex-col gap-3'>
                  {leaveBalance.map((lb) => {
                    const pct = lb.totalBalance > 0 ? (lb.used / lb.totalBalance) * 100 : 0
                    return (
                      <div
                        key={lb.leaveTypeId}
                        className='rounded-xl border border-border bg-card p-4'
                      >
                        <div className='mb-3 flex items-start justify-between'>
                          <div>
                            <p className='text-sm font-semibold text-foreground'>
                              {lb.leaveTypeName}
                            </p>
                            <div className='mt-0.5 flex gap-2'>
                              {lb.isPaid && (
                                <Badge variant='green' className='text-[10px]'>
                                  Berbayar
                                </Badge>
                              )}
                              {lb.canCarryForward && (
                                <Badge variant='blue' className='text-[10px]'>
                                  Carry Forward
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            <p className='text-2xl font-extrabold text-primary'>{lb.remaining}</p>
                            <p className='text-xs text-muted-foreground'>
                              dari {lb.totalBalance} hari
                            </p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                          <div
                            className='h-full rounded-full bg-primary transition-all'
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className='mt-1.5 flex justify-between text-[10px] text-muted-foreground'>
                          <span>Terpakai: {lb.used} hari</span>
                          <span>Sisa: {lb.remaining} hari</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  Data saldo cuti belum tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppMain>
  )
}
