// conditions-routing-page.tsx
import { IconInfoCircle, IconPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'

import { useSaveWorkflowRoutingRules, useWorkflow, useWorkflowRoutingRules } from '../hooks'
import type { RoutingRule, Workflow } from '../types'
import { RuleCard } from './components/rule-card'

interface ConditionsRoutingPageProps {
  workflowId: string
}

export function ConditionsRoutingPage({ workflowId }: ConditionsRoutingPageProps) {
  const { data: workflow, isPending: isPendingWorkflow, error: workflowError } = useWorkflow(workflowId)
  const { data: rules, isPending: isPendingRules, error: rulesError } = useWorkflowRoutingRules(workflowId)

  const isPending = isPendingWorkflow || isPendingRules
  const error = workflowError || rulesError

  if (isPending || error || !workflow || !rules) {
    return <AppMain pending={isPending} error={error} notFound={!workflow} />
  }

  return (
    <ConditionsRoutingForm
      workflowId={workflowId}
      workflow={workflow}
      initialRules={rules}
    />
  )
}

interface ConditionsRoutingFormProps {
  workflowId: string
  workflow: Workflow
  initialRules: RoutingRule[]
}

function ConditionsRoutingForm({ workflowId, workflow, initialRules }: ConditionsRoutingFormProps) {
  const { mutateAsync: saveRules, isPending: isSaving } = useSaveWorkflowRoutingRules(workflowId)
  const [localRules, setLocalRules] = useState<RoutingRule[]>(initialRules)

  const handleSave = async () => {
    try {
      await saveRules(localRules)
      snackbar.success('Routing rules berhasil disimpan!')
    } catch (err) {
      snackbar.exception(err)
    }
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: 'Pengaturan' },
        { to: '/settings/approval-workflow', label: 'Approval Workflow' },
        { to: '.', label: 'Conditions & Routing' },
      ]}
      title={'Conditions & Routing Rules'}
      subtitle={`${workflow.name} — Tentukan kondisi untuk menentukan jalur approval`}
      actions={
        <>
          <Button asChild variant='outline' size='sm'>
            <Link to='/settings/approval-workflow/$id/test' params={{ id: workflowId }}>
              Test Workflow
            </Link>
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={isSaving}
            onClick={() =>
              setLocalRules((prev) => [
                ...prev,
                {
                  id: `rule-${Date.now()}`,
                  workflowId,
                  name: `Rule ${prev.length + 1}`,
                  priority: prev.length + 1,
                  conditions: { id: `grp-${Date.now()}`, logic: 'AND', rules: [] },
                },
              ])
            }
          >
            <IconPlus size={16} stroke={2.5} />
            Tambah Rule
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]'>
        {/* Rules list */}
        <div className='flex flex-col gap-3'>
          {localRules.length === 0 ? (
            <div className='flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-16 text-center'>
              <p className='text-sm text-muted-foreground'>Belum ada routing rule</p>
              <p className='max-w-xs text-xs text-muted-foreground'>
                Tambahkan rule untuk mengatur kondisi kapan workflow ini aktif atau level mana yang
                dilewati.
              </p>
            </div>
          ) : (
            localRules.map((rule, idx) => (
              <RuleCard key={rule.id} rule={rule} idx={idx} total={localRules.length} />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
            <h3 className='mb-3 text-sm font-semibold'>Tentang Routing Rules</h3>
            <div className='flex flex-col gap-2.5 text-xs text-muted-foreground'>
              <p>
                Rules dievaluasi secara berurutan dari prioritas tertinggi. Rule pertama yang cocok
                akan digunakan.
              </p>
              <div className='rounded-xl bg-muted/50 p-3'>
                <p className='mb-1 font-semibold text-foreground'>Contoh penggunaan:</p>
                <ul className='list-inside list-disc space-y-1'>
                  <li>Cuti &gt; 5 hari → tambah level Director</li>
                  <li>Amount &gt; 10jt → wajib Finance Approval</li>
                  <li>Dept. Engineering → skip HR Level</li>
                </ul>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20'>
            <div className='flex gap-2'>
              <IconInfoCircle
                size={15}
                className='mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400'
              />
              <p className='text-[11px] text-amber-700 dark:text-amber-400'>
                Jika tidak ada rule yang cocok, workflow default akan digunakan dengan semua level
                approver.
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving}
            className='w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Semua Rule'}
          </button>
        </div>
      </div>
    </AppMain>
  )
}
