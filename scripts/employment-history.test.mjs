import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import dayjs from 'dayjs'
import ts from 'typescript'
import { z } from 'zod'

const feature = new URL('../src/features/employment/employee-profile/', import.meta.url)
const messages = new Proxy({}, { get: (_, key) => () => String(key) })

function schemaFromComponent(name) {
  const source = ts.createSourceFile(name, readFileSync(new URL(`components/${name}.tsx`, feature), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let body
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'useSchema') body = node.arguments[0].body.getText(source)
    ts.forEachChild(node, visit)
  }
  visit(source)
  assert.ok(body)
  return new Function('z', 'm', 'dayjs', `return z.object${body}`)(z, messages, dayjs)
}

test('document form requires a title/file and rejects unsupported or oversized files', () => {
  const schema = schemaFromComponent('employee-employment-document-dialog')
  const valid = { title: ' Contract ', category: 'contract', notes: '', file: new File(['pdf'], 'contract.pdf', { type: 'application/pdf' }) }
  assert.equal(schema.parse(valid).title, 'Contract')
  for (const change of [
    { title: ' ' }, { file: undefined },
    { file: new File(['x'], 'contract.exe', { type: 'application/pdf' }) },
    { file: new File(['x'], 'contract.pdf', { type: 'text/plain' }) },
    { file: new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' }) },
  ]) assert.equal(schema.safeParse({ ...valid, ...change }).success, false)
})

test('screening form rejects blank notes, impossible/future dates and unknown outcomes', () => {
  const schema = schemaFromComponent('employee-employment-screening-dialog')
  const valid = { screeningDate: dayjs().format('YYYY-MM-DD'), result: 'follow_up', notes: 'Check work reference' }
  assert.equal(schema.safeParse(valid).success, true)
  for (const change of [{ notes: ' ' }, { screeningDate: '2026-02-30' }, { screeningDate: dayjs().add(1, 'day').format('YYYY-MM-DD') }, { result: 'unknown' }])
    assert.equal(schema.safeParse({ ...valid, ...change }).success, false)
})

test('document and screening requests target the chosen employee/period without JSON-encoding files', async () => {
  const calls = []
  const apiClient = { post: async (...args) => { calls.push(args); return { data: { success: true, data: { id: 'saved' } } } } }
  const source = readFileSync(new URL('api.ts', feature), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const exports = {}
  new Function('require', 'exports', output)((name) => { assert.equal(name, '@/shared/lib/axios'); return { apiClient } }, exports)
  const file = new File(['pdf'], 'contract.pdf', { type: 'application/pdf' })
  await exports.uploadEmployeeEmploymentDocument('employee/1', 'period/2', { title: 'Contract', category: 'contract', notes: '', file }, 'request-1')
  assert.equal(calls[0][0], '/api/v1/company/employees/employee%2F1/employment-periods/period%2F2/documents')
  assert.ok(calls[0][1] instanceof FormData)
  assert.equal(calls[0][1].get('file').name, 'contract.pdf')
  assert.equal(calls[0][1].get('title'), 'Contract')
  assert.equal(calls[0][2].headers['Content-Type'], undefined)
  assert.equal(calls[0][2].headers['Idempotency-Key'], 'request-1')
  const input = { screeningDate: '2026-10-27', result: 'passed', notes: 'Reference checked' }
  await exports.createEmployeeEmploymentScreening('employee/1', 'period/2', input, 'request-2')
  assert.equal(calls[1][0], '/api/v1/company/employees/employee%2F1/employment-periods/period%2F2/screenings')
  assert.deepEqual(calls[1][1], input)
  assert.equal('reviewerName' in calls[1][1], false)
})
