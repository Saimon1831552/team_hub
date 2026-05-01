import { create } from 'zustand'

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  current: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrent: (workspace) => set({ current: workspace }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
}))