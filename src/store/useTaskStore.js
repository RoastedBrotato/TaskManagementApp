/**
 * Task Store
 * 
 * Zustand store for managing the application's task state.
 * Provides centralized state management for tasks.
 * 
 * @module TaskStore
 */

import { create }  from 'zustand';

const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
}));

export default useTaskStore;
