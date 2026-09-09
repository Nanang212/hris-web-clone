// src/features/organization/unit/pages/structure/organization-structure-tab.tsx
import {
  IconArrowsMove,
  IconBriefcase,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconFolderPlus,
  IconHierarchy,
  IconMail,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { snackbar } from '@/shared/lib/snackbar'

import { AddEditUnitModal, DeleteUnitDialog, MoveUnitModal } from '../../components/unit-modals'
import { getDummyMembersForNode, INITIAL_ORG_TREE, MOCK_ORG_STATS } from '../../data/mock-org-data'
import type { AddEditUnitPayload, MoveUnitPayload, OrgLevel, OrgNode } from '../../types'

export function OrganizationStructureTab() {
  const [treeData, setTreeData] = useState<OrgNode>(INITIAL_ORG_TREE)
  const [selectedNode, setSelectedNode] = useState<OrgNode>(INITIAL_ORG_TREE)
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  // Expanded tree nodes state
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'org-root': true,
    'div-tech': true,
    'dept-se': true,
    'div-hr': true,
    'div-fin': false,
    'div-sls': false,
  })

  // Modal States
  const [addEditModalOpen, setAddEditModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [targetParent, setTargetParent] = useState<OrgNode | null>(null)
  const [nodeToEdit, setNodeToEdit] = useState<OrgNode | null>(null)

  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [nodeToMove, setNodeToMove] = useState<OrgNode | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<OrgNode | null>(null)

  // Flattened nodes list for parent selector
  const allNodesList = useMemo(() => {
    const list: { id: string; name: string; level: OrgLevel }[] = []
    const traverse = (node: OrgNode) => {
      list.push({ id: node.id, name: node.name, level: node.level })
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    traverse(treeData)
    return list
  }, [treeData])

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }))
  }

  const [memberSearch, setMemberSearch] = useState('')

  // Selected Unit Members list (matching totalEmployees count exactly)
  const selectedMembers = useMemo(() => {
    return selectedNode ? getDummyMembersForNode(selectedNode) : []
  }, [selectedNode])

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return selectedMembers
    const q = memberSearch.toLowerCase()
    return selectedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.nik.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q),
    )
  }, [selectedMembers, memberSearch])

  const handleExpandAll = () => {
    const newExpanded: Record<string, boolean> = {}
    const traverse = (node: OrgNode) => {
      newExpanded[node.id] = true
      if (node.children) node.children.forEach(traverse)
    }
    traverse(treeData)
    setExpandedNodes(newExpanded)
  }

  const handleCollapseAll = () => {
    setExpandedNodes({ 'org-root': true })
  }

  // Handle Add Sub-unit
  const handleOpenAddSubUnit = (parent: OrgNode) => {
    setModalMode('add')
    setTargetParent(parent)
    setNodeToEdit(null)
    setAddEditModalOpen(true)
  }

  // Handle Edit Unit
  const handleOpenEditUnit = (node: OrgNode) => {
    setModalMode('edit')
    setNodeToEdit(node)
    setTargetParent(null)
    setAddEditModalOpen(true)
  }

  // Handle Move Unit
  const handleOpenMoveUnit = (node: OrgNode) => {
    setNodeToMove(node)
    setMoveModalOpen(true)
  }

  // Handle Delete Unit
  const handleOpenDeleteUnit = (node: OrgNode) => {
    setNodeToDelete(node)
    setDeleteDialogOpen(true)
  }

  // Save Add/Edit
  const handleSaveUnit = (payload: AddEditUnitPayload) => {
    if (modalMode === 'add') {
      const newNode: OrgNode = {
        id: `node-${Date.now()}`,
        code: payload.code,
        name: payload.name,
        level: payload.level,
        parentId: payload.parentId,
        headOfUnit: payload.headOfUnitName
          ? {
              id: `emp-${Date.now()}`,
              name: payload.headOfUnitName,
              title: payload.headOfUnitTitle || payload.name,
            }
          : undefined,
        costCenter: payload.costCenter,
        totalEmployees: payload.level === 'position' ? 1 : 0,
        totalSubUnits: 0,
        status: payload.status,
        description: payload.description,
        children: [],
      }

      // Add to tree recursively
      const addRecursively = (node: OrgNode): OrgNode => {
        if (node.id === payload.parentId) {
          return {
            ...node,
            totalSubUnits: (node.totalSubUnits || 0) + 1,
            children: [...(node.children || []), newNode],
          }
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(addRecursively),
          }
        }
        return node
      }

      const updated = addRecursively(treeData)
      setTreeData(updated)
      setSelectedNode(newNode)
      if (payload.parentId) {
        setExpandedNodes((prev) => ({ ...prev, [payload.parentId!]: true }))
      }
      snackbar.success(`Unit ${payload.name} berhasil ditambahkan!`)
    } else if (modalMode === 'edit' && payload.id) {
      // Edit in tree
      const updateRecursively = (node: OrgNode): OrgNode => {
        if (node.id === payload.id) {
          const updated: OrgNode = {
            ...node,
            name: payload.name,
            code: payload.code,
            level: payload.level,
            costCenter: payload.costCenter,
            status: payload.status,
            description: payload.description,
            headOfUnit: payload.headOfUnitName
              ? {
                  id: node.headOfUnit?.id || `emp-${Date.now()}`,
                  name: payload.headOfUnitName,
                  title: payload.headOfUnitTitle || payload.name,
                }
              : undefined,
          }
          if (selectedNode.id === node.id) {
            setSelectedNode(updated)
          }
          return updated
        }
        if (node.children) {
          return { ...node, children: node.children.map(updateRecursively) }
        }
        return node
      }

      const updated = updateRecursively(treeData)
      setTreeData(updated)
      snackbar.success(`Data unit ${payload.name} berhasil diperbarui!`)
    }
  }

  // Confirm Move Unit
  const handleConfirmMove = (payload: MoveUnitPayload) => {
    let movedNode: OrgNode | null = null

    // Extract node
    const removeRecursively = (node: OrgNode): OrgNode => {
      if (!node.children) return node
      const found = node.children.find((c) => c.id === payload.unitId)
      if (found) {
        movedNode = { ...found, parentId: payload.newParentId }
        return {
          ...node,
          totalSubUnits: Math.max(0, (node.totalSubUnits || 1) - 1),
          children: node.children.filter((c) => c.id !== payload.unitId),
        }
      }
      return { ...node, children: node.children.map(removeRecursively) }
    }

    const treeWithoutMoved = removeRecursively(treeData)

    if (movedNode) {
      const insertRecursively = (node: OrgNode): OrgNode => {
        if (node.id === payload.newParentId) {
          return {
            ...node,
            totalSubUnits: (node.totalSubUnits || 0) + 1,
            children: [...(node.children || []), movedNode!],
          }
        }
        if (node.children) {
          return { ...node, children: node.children.map(insertRecursively) }
        }
        return node
      }

      const newTree = insertRecursively(treeWithoutMoved)
      setTreeData(newTree)
      setSelectedNode(movedNode)
      setExpandedNodes((prev) => ({ ...prev, [payload.newParentId]: true }))
      snackbar.success('Unit berhasil dipindahkan dalam struktur organisasi!')
    }
  }

  // Confirm Delete Unit
  const handleConfirmDelete = (nodeId: string) => {
    const deleteRecursively = (node: OrgNode): OrgNode => {
      if (!node.children) return node
      return {
        ...node,
        children: node.children.filter((c) => c.id !== nodeId).map(deleteRecursively),
      }
    }

    const newTree = deleteRecursively(treeData)
    setTreeData(newTree)
    setSelectedNode(newTree)
    snackbar.success('Unit organisasi berhasil dihapus.')
  }

  // Flat filtered list for specific level views (Divisions Only, Departments Only, Positions Only)
  const flatFilteredNodes = useMemo(() => {
    if (levelFilter === 'all') return []
    const list: OrgNode[] = []
    const q = searchQuery.toLowerCase().trim()

    const traverse = (node: OrgNode) => {
      if (node.level === levelFilter) {
        const matchesSearch =
          q === '' ||
          node.name.toLowerCase().includes(q) ||
          node.code.toLowerCase().includes(q) ||
          (node.headOfUnit?.name && node.headOfUnit.name.toLowerCase().includes(q))
        if (matchesSearch) {
          list.push(node)
        }
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    traverse(treeData)
    return list
  }, [treeData, levelFilter, searchQuery])

  // Dynamic filtered tree for "All Levels" view
  const filteredTreeData = useMemo(() => {
    if (levelFilter !== 'all') return null
    const q = searchQuery.toLowerCase().trim()
    if (q === '') return treeData

    const filterNode = (node: OrgNode): OrgNode | null => {
      const selfMatches =
        node.name.toLowerCase().includes(q) ||
        node.code.toLowerCase().includes(q) ||
        (node.headOfUnit?.name && node.headOfUnit.name.toLowerCase().includes(q))

      const filteredChildren = (node.children || [])
        .map(filterNode)
        .filter((c): c is OrgNode => c !== null)

      if (selfMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        }
      }
      return null
    }

    return filterNode(treeData)
  }, [treeData, searchQuery, levelFilter])

  // Count visible units in filtered tree or flat list
  const visibleUnitsCount = useMemo(() => {
    if (levelFilter === 'all') {
      let count = 0
      const countRec = (node: OrgNode) => {
        count++
        if (node.children) node.children.forEach(countRec)
      }
      if (filteredTreeData) countRec(filteredTreeData)
      return count
    }
    return flatFilteredNodes.length
  }, [levelFilter, filteredTreeData, flatFilteredNodes])

  // Auto-expand nodes when filter or search query is applied
  useEffect(() => {
    if (levelFilter === 'all' && searchQuery.trim() !== '') {
      const newExpanded: Record<string, boolean> = {}
      const expandAllRec = (node: OrgNode) => {
        newExpanded[node.id] = true
        if (node.children) node.children.forEach(expandAllRec)
      }
      if (filteredTreeData) expandAllRec(filteredTreeData)
      setExpandedNodes((prev) => ({ ...prev, ...newExpanded }))
    }
  }, [levelFilter, searchQuery, filteredTreeData])

  const getLevelBadgeClass = (level: OrgLevel) => {
    switch (level) {
      case 'company':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
      case 'division':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
      case 'department':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
      case 'position':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    }
  }

  // Recursive Tree / Flat Node Renderer
  const renderTreeNode = (node: OrgNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes[node.id] ?? true
    const isSelected = selectedNode.id === node.id
    const isTreeMode = levelFilter === 'all'

    return (
      <div key={node.id} className='relative select-none'>
        <div
          onClick={() => setSelectedNode(node)}
          className={`group flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition-all ${
            isSelected
              ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
              : 'border-border/70 bg-card hover:border-border hover:bg-muted/30'
          }`}
          style={{ marginLeft: isTreeMode ? `${depth * 20}px` : '0px' }}
        >
          <div className='flex min-w-0 flex-1 items-center gap-2.5 pr-2'>
            {/* Collapse toggle button in tree mode */}
            {isTreeMode && hasChildren ? (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpand(node.id)
                }}
                className='flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors hover:bg-muted'
              >
                {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
              </button>
            ) : isTreeMode ? (
              <span className='flex size-6 shrink-0 items-center justify-center'>
                <span className='size-1.5 rounded-full bg-border' />
              </span>
            ) : null}

            {/* Level Icon */}
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                node.level === 'company'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                  : node.level === 'division'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : node.level === 'department'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {node.level === 'company' && <IconBuildingSkyscraper size={16} />}
              {node.level === 'division' && <IconBuilding size={16} />}
              {node.level === 'department' && <IconHierarchy size={16} />}
              {node.level === 'position' && <IconBriefcase size={16} />}
            </div>

            {/* Title, code and leader info */}
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-xs font-bold text-foreground'>{node.name}</span>
                <span className='shrink-0 font-mono text-[10px] text-muted-foreground uppercase'>
                  {node.code}
                </span>
                <span
                  className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase ${getLevelBadgeClass(
                    node.level,
                  )}`}
                >
                  {node.level}
                </span>
                {node.parentName && !isTreeMode && (
                  <span className='rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground'>
                    under {node.parentName}
                  </span>
                )}
              </div>
              <div className='mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground'>
                {node.headOfUnit ? (
                  <span className='flex items-center gap-1 truncate'>
                    <IconUser size={12} className='shrink-0 opacity-70' />
                    <span className='truncate'>{node.headOfUnit.name}</span>
                  </span>
                ) : (
                  <span className='italic opacity-60'>No Head Assigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Right badges & actions */}
          <div className='flex shrink-0 items-center gap-2'>
            <div className='flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground'>
              <IconUsers size={12} className='text-muted-foreground' />
              <span>{node.totalEmployees}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className='flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted'>
                  <IconDotsVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44 rounded-xl'>
                <DropdownMenuItem onClick={() => handleOpenAddSubUnit(node)} className='text-xs'>
                  <IconPlus size={14} className='mr-2 text-primary' /> Add Sub-unit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEditUnit(node)} className='text-xs'>
                  <IconEdit size={14} className='mr-2 text-muted-foreground' /> Edit Unit
                </DropdownMenuItem>
                {node.level !== 'company' && (
                  <DropdownMenuItem onClick={() => handleOpenMoveUnit(node)} className='text-xs'>
                    <IconArrowsMove size={14} className='mr-2 text-amber-600' /> Move Unit
                  </DropdownMenuItem>
                )}
                {node.level !== 'company' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleOpenDeleteUnit(node)}
                      className='text-xs text-destructive focus:text-destructive'
                    >
                      <IconTrash size={14} className='mr-2' /> Delete Unit
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Child nodes in Tree mode */}
        {isTreeMode && hasChildren && isExpanded && (
          <div className='mt-2 ml-3 space-y-2 border-l border-border/60 pl-2'>
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* ── Top Overview Stats ─────────────────────────────────────────────── */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {[
          {
            label: 'Total Divisions',
            value: MOCK_ORG_STATS.totalDivisions,
            sub: 'Divisi Utama',
            icon: IconBuilding,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
          },
          {
            label: 'Total Departments',
            value: MOCK_ORG_STATS.totalDepartments,
            sub: '24 Aktif',
            icon: IconHierarchy,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
          },
          {
            label: 'Total Positions',
            value: MOCK_ORG_STATS.totalPositions,
            sub: '144 Terisi',
            icon: IconBriefcase,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
          },
          {
            label: 'Total Employees',
            value: '1,046',
            sub: 'Karyawan Aktif',
            icon: IconUsers,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className='flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs'
          >
            <div>
              <p className='text-xs font-semibold text-muted-foreground'>{stat.label}</p>
              <h3 className='mt-0.5 text-xl font-bold text-foreground'>{stat.value}</h3>
              <p className='mt-0.5 text-[10px] font-medium text-muted-foreground'>{stat.sub}</p>
            </div>
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${stat.color}`}
            >
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Header Filter and Quick Actions ─────────────────────────────────── */}
      <div className='flex flex-col items-start justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center'>
        <div className='flex w-full flex-wrap items-center gap-2.5 sm:w-auto'>
          <div className='relative flex-1 sm:w-64'>
            <IconSearch
              size={14}
              className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Filter organization unit...'
              className='h-9 rounded-xl bg-background pl-9 text-xs'
            />
          </div>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className='h-9 w-36 rounded-xl bg-background text-xs'>
              <SelectValue placeholder='All Levels' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Levels</SelectItem>
              <SelectItem value='division'>Divisions Only</SelectItem>
              <SelectItem value='department'>Departments Only</SelectItem>
              <SelectItem value='position'>Positions Only</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center gap-1 border-l border-border/70 pl-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleExpandAll}
              className='h-9 rounded-xl px-2.5 text-xs font-medium'
            >
              Expand All
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleCollapseAll}
              className='h-9 rounded-xl px-2.5 text-xs font-medium'
            >
              Collapse
            </Button>
          </div>
        </div>

        <Button
          type='button'
          onClick={() => handleOpenAddSubUnit(treeData)}
          className='h-9 w-full shrink-0 gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs sm:w-auto'
        >
          <IconPlus size={15} />
          Add Organization Unit
        </Button>
      </div>

      {/* ── Main Content Grid: Tree (Left 60%) + Contextual Detail (Right 40%) ── */}
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
        {/* Left Column: Organization Tree */}
        <div className='space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs lg:col-span-7'>
          <div className='flex items-center justify-between border-b border-border/70 pb-3'>
            <div>
              <h4 className='text-xs font-bold tracking-wider text-foreground uppercase'>
                Organization Structure Tree
              </h4>
              <p className='mt-0.5 text-[11px] text-muted-foreground'>
                Struktur bagan hierarki unit kerja dan rantai pelaporan organisasi
              </p>
            </div>
            <span className='font-mono text-[11px] text-muted-foreground'>
              {visibleUnitsCount} Units Displayed
            </span>
          </div>

          <div className='max-h-[650px] space-y-2.5 overflow-y-auto pr-1'>
            {levelFilter === 'all' ? (
              filteredTreeData ? (
                renderTreeNode(filteredTreeData, 0)
              ) : (
                <div className='rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground'>
                  Tidak ada unit organisasi yang cocok dengan kriteria filter & pencarian.
                </div>
              )
            ) : flatFilteredNodes.length > 0 ? (
              flatFilteredNodes.map((node) => renderTreeNode(node, 0))
            ) : (
              <div className='rounded-2xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground'>
                Tidak ada unit {levelFilter} yang cocok dengan kriteria filter & pencarian.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contextual Detail Panel */}
        <div className='sticky top-20 space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-xs lg:col-span-5'>
          {/* Header */}
          <div className='flex items-start justify-between gap-3 border-b border-border/70 pb-4'>
            <div className='min-w-0 space-y-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${getLevelBadgeClass(
                    selectedNode.level,
                  )}`}
                >
                  {selectedNode.level}
                </span>
                <Badge
                  variant='outline'
                  className={`text-[10px] font-semibold ${
                    selectedNode.status === 'active'
                      ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {selectedNode.status}
                </Badge>
              </div>
              <h3 className='truncate text-sm font-bold text-foreground'>{selectedNode.name}</h3>
              <p className='font-mono text-xs text-muted-foreground'>{selectedNode.code}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex size-8 items-center justify-center rounded-xl border border-border/80 text-muted-foreground transition-colors hover:bg-muted'>
                  <IconDotsVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44 rounded-xl'>
                <DropdownMenuItem
                  onClick={() => handleOpenAddSubUnit(selectedNode)}
                  className='text-xs'
                >
                  <IconPlus size={14} className='mr-2 text-primary' /> Add Sub-unit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenEditUnit(selectedNode)}
                  className='text-xs'
                >
                  <IconEdit size={14} className='mr-2' /> Edit Details
                </DropdownMenuItem>
                {selectedNode.level !== 'company' && (
                  <DropdownMenuItem
                    onClick={() => handleOpenMoveUnit(selectedNode)}
                    className='text-xs'
                  >
                    <IconArrowsMove size={14} className='mr-2 text-amber-600' /> Move Position
                  </DropdownMenuItem>
                )}
                {selectedNode.level !== 'company' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleOpenDeleteUnit(selectedNode)}
                      className='text-xs text-destructive focus:text-destructive'
                    >
                      <IconTrash size={14} className='mr-2' /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Leader Card */}
          <div className='space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-4'>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
              Head of Unit / Leader
            </span>
            {selectedNode.headOfUnit ? (
              <div className='flex items-center gap-3'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary'>
                  {selectedNode.headOfUnit.name.slice(0, 2).toUpperCase()}
                </div>
                <div className='min-w-0 flex-1'>
                  <h5 className='truncate text-xs font-bold text-foreground'>
                    {selectedNode.headOfUnit.name}
                  </h5>
                  <p className='truncate text-[11px] text-muted-foreground'>
                    {selectedNode.headOfUnit.title}
                  </p>
                  {selectedNode.headOfUnit.email && (
                    <p className='mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground/80'>
                      <IconMail size={11} /> {selectedNode.headOfUnit.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className='text-xs text-muted-foreground italic'>
                Belum ada kepala unit yang ditugaskan
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='rounded-xl border border-border/70 bg-card p-3'>
              <span className='block text-[10px] font-semibold text-muted-foreground uppercase'>
                Parent Unit
              </span>
              <span className='mt-0.5 block truncate font-bold text-foreground'>
                {selectedNode.parentName || 'Holding Root'}
              </span>
            </div>

            <div className='rounded-xl border border-border/70 bg-card p-3'>
              <span className='block text-[10px] font-semibold text-muted-foreground uppercase'>
                Cost Center Code
              </span>
              <span className='mt-0.5 block font-mono font-bold text-foreground'>
                {selectedNode.costCenter || '-'}
              </span>
            </div>

            <div className='rounded-xl border border-border/70 bg-card p-3'>
              <span className='block text-[10px] font-semibold text-muted-foreground uppercase'>
                Total Sub-units
              </span>
              <span className='mt-0.5 block font-bold text-foreground'>
                {selectedNode.totalSubUnits || selectedNode.children?.length || 0} Sub-units
              </span>
            </div>

            <div className='rounded-xl border border-border/70 bg-card p-3'>
              <span className='block text-[10px] font-semibold text-muted-foreground uppercase'>
                Total Employees
              </span>
              <span className='mt-0.5 block font-bold text-primary'>
                {selectedNode.totalEmployees} Karyawan
              </span>
            </div>
          </div>

          {/* Description */}
          {selectedNode.description && (
            <div className='space-y-1 text-xs'>
              <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase'>
                Description & Functions
              </span>
              <p className='rounded-xl border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground'>
                {selectedNode.description}
              </p>
            </div>
          )}

          {/* Child Sub-units Preview */}
          {selectedNode.children && selectedNode.children.length > 0 && (
            <div className='space-y-2 border-t border-border/70 pt-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='font-bold text-foreground'>Direct Child Sub-units</span>
                <span className='text-[11px] text-muted-foreground'>
                  {selectedNode.children.length} Units
                </span>
              </div>
              <div className='max-h-40 space-y-1.5 overflow-y-auto pr-1'>
                {selectedNode.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => setSelectedNode(child)}
                    className='flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-muted/10 p-2.5 text-xs transition-colors hover:bg-muted/30'
                  >
                    <div className='min-w-0 pr-2'>
                      <p className='truncate font-bold text-foreground'>{child.name}</p>
                      <p className='font-mono text-[10px] text-muted-foreground'>{child.code}</p>
                    </div>
                    <span className='shrink-0 rounded-md bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground'>
                      {child.totalEmployees} Karyawan
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Team Members & Personnel */}
          <div className='space-y-2 border-t border-border/70 pt-2'>
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1.5 font-bold text-foreground'>
                <IconUsers size={14} className='text-primary' />
                Daftar Karyawan ({selectedMembers.length})
              </span>
              <span className='text-[10px] font-semibold tracking-wider text-muted-foreground uppercase'>
                {selectedNode.level}
              </span>
            </div>

            {selectedMembers.length > 4 && (
              <div className='relative'>
                <IconSearch
                  size={13}
                  className='absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type='text'
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder={`Cari dari ${selectedMembers.length} karyawan...`}
                  className='h-8 w-full rounded-xl border border-border/80 bg-background pr-2.5 pl-8 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none'
                />
              </div>
            )}

            <div className='max-h-60 space-y-2 overflow-y-auto pr-1'>
              {filteredMembers.length === 0 ? (
                <div className='rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground italic'>
                  {memberSearch
                    ? 'Tidak ada karyawan yang cocok dengan pencarian.'
                    : 'Belum ada personil terdaftar di unit ini.'}
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2.5 text-xs transition-colors hover:bg-muted/30'
                  >
                    <div className='flex min-w-0 items-center gap-2.5'>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className='size-8 shrink-0 rounded-lg border border-border object-cover'
                        />
                      ) : (
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary'>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          <p className='truncate text-[12px] font-bold text-foreground'>
                            {member.name}
                          </p>
                          <span className='py-0.2 shrink-0 rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground'>
                            {member.nik}
                          </span>
                        </div>
                        <p className='truncate text-[11px] text-muted-foreground'>{member.title}</p>
                        {member.email && (
                          <p className='flex items-center gap-1 truncate text-[10px] text-primary/90'>
                            <IconMail size={10} className='shrink-0' />
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className={`shrink-0 px-1.5 py-0 text-[9px] font-semibold ${
                        member.status === 'active'
                          ? 'border-emerald-500/30 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/20'
                          : member.status === 'probation'
                            ? 'border-amber-500/30 bg-amber-50/50 text-amber-600'
                            : 'border-blue-500/30 bg-blue-50/50 text-blue-600'
                      }`}
                    >
                      {member.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className='flex flex-col gap-2 border-t border-border/70 pt-3'>
            <Button
              type='button'
              onClick={() => handleOpenAddSubUnit(selectedNode)}
              className='h-9.5 gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs'
            >
              <IconPlus size={15} />
              Add Sub-unit under {selectedNode.name.slice(0, 18)}...
            </Button>

            <div className='grid grid-cols-2 gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenEditUnit(selectedNode)}
                className='h-9 rounded-xl text-xs font-semibold'
              >
                <IconEdit size={14} className='mr-1.5 text-muted-foreground' /> Edit Unit
              </Button>
              {selectedNode.level !== 'company' && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleOpenMoveUnit(selectedNode)}
                  className='h-9 rounded-xl text-xs font-semibold text-amber-600 hover:text-amber-700'
                >
                  <IconArrowsMove size={14} className='mr-1.5' /> Move Unit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals & Dialogs ───────────────────────────────────────────────── */}
      <AddEditUnitModal
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        mode={modalMode}
        initialParent={targetParent}
        initialNode={nodeToEdit}
        allNodes={allNodesList}
        onSave={handleSaveUnit}
      />

      <MoveUnitModal
        open={moveModalOpen}
        onOpenChange={setMoveModalOpen}
        node={nodeToMove}
        allNodes={allNodesList}
        onConfirmMove={handleConfirmMove}
      />

      <DeleteUnitDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        node={nodeToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  )
}
