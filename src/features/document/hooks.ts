// hooks.ts — React Query hooks for Document Center feature
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  createAttachment,
  createCertificate,
  deleteAttachments,
  deleteCertificates,
  getAttachments,
  getAttachmentStats,
  getCertificates,
  getCertificateStats,
  getDocumentCompletenessList,
  getDocumentOverviewStats,
  getEmployeeDocumentDetails,
  saveEmployeeDocuments,
  updateAttachment,
  updateCertificate,
} from '@/features/document/api'
import type {
  CreateAttachmentPayload,
  CreateCertificatePayload,
  SaveEmployeeDocumentsPayload,
  UpdateAttachmentPayload,
  UpdateCertificatePayload,
} from '@/features/document/types'

export const documentQueryKeys = {
  all: ['documents'] as const,
  overviewStats: () => [...documentQueryKeys.all, 'overview-stats'] as const,
  completenessList: (search?: string, department?: string, status?: string, completeness?: string) =>
    [...documentQueryKeys.all, 'completeness-list', search, department, status, completeness] as const,
  employeeDetails: (employeeId?: string) =>
    [...documentQueryKeys.all, 'employee-details', employeeId] as const,
  certificates: (search?: string, issuer?: string, status?: string, expiryRange?: string, employeeId?: string) =>
    [...documentQueryKeys.all, 'certificates', search, issuer, status, expiryRange, employeeId] as const,
  certificateStats: () => [...documentQueryKeys.all, 'certificate-stats'] as const,
  attachments: (search?: string, category?: string, employeeId?: string) =>
    [...documentQueryKeys.all, 'attachments', search, category, employeeId] as const,
  attachmentStats: () => [...documentQueryKeys.all, 'attachment-stats'] as const,
}

// ─── Overview Hooks ─────────────────────────────────────────────────────────

export function useGetDocumentOverviewStats() {
  return useQuery({
    queryKey: documentQueryKeys.overviewStats(),
    queryFn: getDocumentOverviewStats,
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useGetDocumentCompletenessList(
  search?: string,
  department?: string,
  status?: string,
  completeness?: string,
) {
  return useQuery({
    queryKey: documentQueryKeys.completenessList(search, department, status, completeness),
    queryFn: () => getDocumentCompletenessList(search, department, status, completeness),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useGetEmployeeDocumentDetails(employeeId?: string) {
  return useQuery({
    queryKey: documentQueryKeys.employeeDetails(employeeId),
    queryFn: () => (employeeId ? getEmployeeDocumentDetails(employeeId) : Promise.resolve({ success: true, code: '200', data: null, messages: [] })),
    select: ({ data }) => data,
    enabled: Boolean(employeeId),
    placeholderData: keepPreviousData,
  })
}

export function useSaveEmployeeDocuments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaveEmployeeDocumentsPayload) => saveEmployeeDocuments(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}

// ─── Certificate Hooks ──────────────────────────────────────────────────────

export function useGetCertificateStats() {
  return useQuery({
    queryKey: documentQueryKeys.certificateStats(),
    queryFn: getCertificateStats,
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useGetCertificates(
  search?: string,
  issuer?: string,
  status?: string,
  expiryRange?: string,
  employeeId?: string,
) {
  return useQuery({
    queryKey: documentQueryKeys.certificates(search, issuer, status, expiryRange, employeeId),
    queryFn: () => getCertificates(search, issuer, status, expiryRange, employeeId),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useCreateCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCertificatePayload) => createCertificate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCertificatePayload) => updateCertificate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}

export function useDeleteCertificates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => deleteCertificates(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}

// ─── Attachment Hooks ───────────────────────────────────────────────────────

export function useGetAttachmentStats() {
  return useQuery({
    queryKey: documentQueryKeys.attachmentStats(),
    queryFn: getAttachmentStats,
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useGetAttachments(search?: string, category?: string, employeeId?: string) {
  return useQuery({
    queryKey: documentQueryKeys.attachments(search, category, employeeId),
    queryFn: () => getAttachments(search, category, employeeId),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useCreateAttachment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAttachmentPayload) => createAttachment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}

export function useUpdateAttachment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAttachmentPayload) => updateAttachment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}

export function useDeleteAttachments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => deleteAttachments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all })
    },
  })
}
