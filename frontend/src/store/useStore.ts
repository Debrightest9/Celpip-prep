import { create } from 'zustand';
import { User, Session, Question } from '@/types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  // Active practice session
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;

  currentQuestion: Question | null;
  setCurrentQuestion: (q: Question | null) => void;

  isLoadingQuestion: boolean;
  setIsLoadingQuestion: (v: boolean) => void;

  isEvaluating: boolean;
  setIsEvaluating: (v: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),

  currentQuestion: null,
  setCurrentQuestion: (q) => set({ currentQuestion: q }),

  isLoadingQuestion: false,
  setIsLoadingQuestion: (v) => set({ isLoadingQuestion: v }),

  isEvaluating: false,
  setIsEvaluating: (v) => set({ isEvaluating: v }),
}));
