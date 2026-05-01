import { create } from 'zustand'

export const useGoalStore = create((set) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) =>
    set((state) => ({ goals: [goal, ...state.goals] })),
  updateGoal: (id, data) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    })),
  removeGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
}))