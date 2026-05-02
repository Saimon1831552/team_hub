import { create } from 'zustand'

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  current: null,
  onlineUsers: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrent: (workspace) => set({ current: workspace }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
}))