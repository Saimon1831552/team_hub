import { create } from 'zustand'

export const useGoalStore = create((set) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) =>
    set((state) => {
      // Prevent duplicate — check if goal already exists
      const exists = state.goals.some((g) => g.id === goal.id)
      if (exists) return state
      return { goals: [goal, ...state.goals] }
    }),
  updateGoal: (id, data) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    })),
  removeGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
}))