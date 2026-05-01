import { create } from 'zustand'

export const useActionStore = create((set) => ({
  actions: [],
  setActions: (actions) => set({ actions }),
  addAction: (action) =>
    set((state) => ({ actions: [action, ...state.actions] })),
  updateAction: (id, data) =>
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),
  removeAction: (id) =>
    set((state) => ({ actions: state.actions.filter((a) => a.id !== id) })),
}))