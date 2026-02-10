import { create } from "zustand";

export interface TimerResult {
  projectId: string;
  projectName: string;
  category: string;
  taskDescription: string;
  minutes: number;
  startedAt: string; // ISO date YYYY-MM-DD
}

interface TimerState {
  isRunning: boolean;
  startedAt: number | null;
  projectId: string | null;
  projectName: string | null;
  category: string | null;
  taskDescription: string;
  elapsedSeconds: number;

  start: (
    projectId: string,
    projectName: string,
    category: string,
    taskDescription?: string,
  ) => void;
  stop: () => TimerResult | null;
  reset: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  startedAt: null,
  projectId: null,
  projectName: null,
  category: null,
  taskDescription: "",
  elapsedSeconds: 0,

  start: (projectId, projectName, category, taskDescription = "") =>
    set({
      isRunning: true,
      startedAt: Date.now(),
      projectId,
      projectName,
      category,
      taskDescription,
      elapsedSeconds: 0,
    }),

  stop: () => {
    const { isRunning, startedAt, projectId, projectName, category, taskDescription } =
      get();
    if (!isRunning || !startedAt || !projectId || !category) return null;

    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const minutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    const startDate = new Date(startedAt);
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, "0");
    const dd = String(startDate.getDate()).padStart(2, "0");

    set({
      isRunning: false,
      startedAt: null,
      projectId: null,
      projectName: null,
      category: null,
      taskDescription: "",
      elapsedSeconds: 0,
    });

    return {
      projectId,
      projectName: projectName ?? "",
      category,
      taskDescription,
      minutes,
      startedAt: `${yyyy}-${mm}-${dd}`,
    };
  },

  reset: () =>
    set({
      isRunning: false,
      startedAt: null,
      projectId: null,
      projectName: null,
      category: null,
      taskDescription: "",
      elapsedSeconds: 0,
    }),

  tick: () => {
    const { isRunning, startedAt } = get();
    if (!isRunning || !startedAt) return;
    set({ elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
  },
}));
