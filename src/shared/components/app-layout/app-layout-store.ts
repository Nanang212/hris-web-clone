import { create } from 'zustand'

interface AppLayoutState {
  backBtnNode: HTMLDivElement | null
  setBackBtnNode: (node: HTMLDivElement | null) => void
  hasBackButton: boolean
  setHasBackButton: (value: boolean) => void
}

export const useAppLayoutStore = create<AppLayoutState>((set) => ({
  backBtnNode: null,
  setBackBtnNode: (node) => set({ backBtnNode: node }),
  hasBackButton: false,
  setHasBackButton: (value) => set({ hasBackButton: value }),
}))
