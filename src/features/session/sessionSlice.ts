import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type SessionData = {
  currentStepIndex: number;
  isRunning: boolean;
  stepRemainingSec: number;
  overallRemainingSec: number;
  lastTickTs?: number;
};

export type SessionState = {
  activeRecipeId: string | null;
  byRecipeId: Record<string, SessionData>;
};

const initialState: SessionState = {
  activeRecipeId: null,
  byRecipeId: {},
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ recipeId: string; stepDurationSec: number; totalDurationSec: number }>) => {
      if (state.activeRecipeId) return;

      const { recipeId, stepDurationSec, totalDurationSec } = action.payload;
      state.activeRecipeId = recipeId;
      state.byRecipeId[recipeId] = {
        currentStepIndex: 0,
        isRunning: true,
        stepRemainingSec: stepDurationSec,
        overallRemainingSec: totalDurationSec,
        lastTickTs: Date.now(),
      };
    },
    pauseSession: (state) => {
      if (!state.activeRecipeId) return;
      const session = state.byRecipeId[state.activeRecipeId];
      if (session) session.isRunning = false;
    },
    resumeSession: (state) => {
      if (!state.activeRecipeId) return;
      const session = state.byRecipeId[state.activeRecipeId];
      if (session) {
        session.isRunning = true;
        session.lastTickTs = Date.now();
      }
    },
    stopStep: (state) => {
      if (!state.activeRecipeId) return;
      const session = state.byRecipeId[state.activeRecipeId];
      if (session) session.isRunning = false;
    },
    endSession: (state) => {
      if (!state.activeRecipeId) return;
      delete state.byRecipeId[state.activeRecipeId];
      state.activeRecipeId = null;
    },
  },
});

export const { startSession, pauseSession, resumeSession, stopStep, endSession } = sessionSlice.actions;

export default sessionSlice.reducer;
