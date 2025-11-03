import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Recipe } from "../../features/receipes/types";

type ByRecipeState = {
    currentStepIndex: number;
    isRunning: boolean;
    stepRemainingSec: number;
    overallRemainingSec: number;
    lastTickTs?: number;
};

type SessionState = {
    activeRecipeId: string | null;
    byRecipeId: Record<string, ByRecipeState>;
};

type SessionContextValue = {
    state: SessionState;
    startSession: (recipe: Recipe) => { ok: boolean; message?: string };
    pauseResume: () => void;
    stopCurrentStep: () => void;
    getByRecipe: (recipeId: string) => ByRecipeState | undefined;
    clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function totalDurationSecOfRecipe(recipe: Recipe) {
    return recipe.steps.reduce((acc, s) => acc + s.durationMinutes * 60, 0);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<SessionState>({ activeRecipeId: null, byRecipeId: {} });
    const tickRef = useRef<number | null>(null);
    const wakeRef = useRef<number | null>(null); 
    const recipesRef = useRef<Record<string, Recipe>>({});

    const cacheRecipe = useCallback((r: Recipe) => {
        recipesRef.current[r.id] = r;
    }, []);

    const startTickerIfNeeded = useCallback(() => {
        if (tickRef.current) return;
        wakeRef.current = Date.now();
        tickRef.current = window.setInterval(() => {
            const now = Date.now();
            setState((prev) => {
                if (!prev.activeRecipeId) return prev;
                const id = prev.activeRecipeId;
                const entry = prev.byRecipeId[id];
                if (!entry || !entry.isRunning) return prev;

                const last = entry.lastTickTs ?? now;
                const deltaSec = Math.floor((now - last) / 1000);
                if (deltaSec <= 0) {
                    return {
                        ...prev,
                        byRecipeId: {
                            ...prev.byRecipeId,
                            [id]: { ...entry, lastTickTs: now },
                        },
                    };
                }

                let stepRemaining = entry.stepRemainingSec - deltaSec;
                let overallRemaining = (entry.overallRemainingSec ?? 0) - deltaSec;

                let newEntry: ByRecipeState = { ...entry, stepRemainingSec: Math.max(0, stepRemaining), overallRemainingSec: Math.max(0, overallRemaining), lastTickTs: now };

                if (stepRemaining <= 0) {
                    const recipe = recipesRef.current[id];
                    const isLast = recipe && entry.currentStepIndex >= recipe.steps.length - 1;
                    if (isLast) {
                        const newBy = { ...prev.byRecipeId };
                        delete newBy[id];
                        return { activeRecipeId: null, byRecipeId: newBy };
                    } else {
                        const nextIndex = entry.currentStepIndex + 1;
                        const recipe = recipesRef.current[id]!;
                        const nextStepDur = recipe.steps[nextIndex].durationMinutes * 60;
                        newEntry = {
                            currentStepIndex: nextIndex,
                            isRunning: true,
                            stepRemainingSec: nextStepDur,
                            overallRemainingSec: Math.max(0, overallRemaining),
                            lastTickTs: now,
                        };
                    }
                }

                return {
                    ...prev,
                    byRecipeId: { ...prev.byRecipeId, [id]: newEntry },
                };
            });
        }, 1000);
    }, []);

    const stopTickerIfIdle = useCallback(() => {
        if (!tickRef.current) return;
        setState((prev) => {
            if (prev.activeRecipeId === null) {
                clearInterval(tickRef.current!);
                tickRef.current = null;
                return prev;
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        return () => {
            if (tickRef.current) {
                clearInterval(tickRef.current);
                tickRef.current = null;
            }
        };
    }, []);

    const startSession = useCallback(
        (recipe: Recipe) => {
            const active = state.activeRecipeId;
            if (active && active !== recipe.id) {
                return { ok: false, message: "Another session is active. Stop it first." };
            }
            if (active === recipe.id) {
                return { ok: true };
            }

            cacheRecipe(recipe);
            const total = totalDurationSecOfRecipe(recipe);
            const firstStepSec = recipe.steps[0].durationMinutes * 60;
            const newBy: ByRecipeState = {
                currentStepIndex: 0,
                isRunning: true,
                stepRemainingSec: firstStepSec,
                overallRemainingSec: total,
                lastTickTs: Date.now(),
            };

            setState((prev) => ({
                activeRecipeId: recipe.id,
                byRecipeId: { ...prev.byRecipeId, [recipe.id]: newBy },
            }));
            startTickerIfNeeded();
            return { ok: true };
        },
        [cacheRecipe, startTickerIfNeeded, state.activeRecipeId]
    );

    const pauseResume = useCallback(() => {
        setState((prev) => {
            const id = prev.activeRecipeId;
            if (!id) return prev;
            const entry = prev.byRecipeId[id];
            if (!entry) return prev;
            const now = Date.now();
            if (entry.isRunning) {
                return {
                    ...prev,
                    byRecipeId: { ...prev.byRecipeId, [id]: { ...entry, isRunning: false, lastTickTs: now } },
                };
            } else {
                return {
                    ...prev,
                    byRecipeId: { ...prev.byRecipeId, [id]: { ...entry, isRunning: true, lastTickTs: now } },
                };
            }
        });
        startTickerIfNeeded();
    }, [startTickerIfNeeded]);

    const stopCurrentStep = useCallback(() => {
        setState((prev) => {
            const id = prev.activeRecipeId;
            if (!id) return prev;
            const entry = prev.byRecipeId[id];
            if (!entry) return prev;
            const recipe = recipesRef.current[id];
            if (!recipe) return prev;
            const isLast = entry.currentStepIndex >= recipe.steps.length - 1;

            if (isLast) {
                const newBy = { ...prev.byRecipeId };
                delete newBy[id];
                return { activeRecipeId: null, byRecipeId: newBy };
            } else {
                const nextIndex = entry.currentStepIndex + 1;
                const nextStepSec = recipe.steps[nextIndex].durationMinutes * 60;
                const remainingOverall = (entry.overallRemainingSec ?? totalDurationSecOfRecipe(recipe)) - (entry.stepRemainingSec ?? 0);
                return {
                    ...prev,
                    byRecipeId: {
                        ...prev.byRecipeId,
                        [id]: {
                            currentStepIndex: nextIndex,
                            isRunning: true,
                            stepRemainingSec: nextStepSec,
                            overallRemainingSec: remainingOverall,
                            lastTickTs: Date.now(),
                        },
                    },
                };
            }
        });
        startTickerIfNeeded();
    }, [startTickerIfNeeded]);

    const getByRecipe = useCallback((recipeId: string) => state.byRecipeId[recipeId], [state]);

    const clearSession = useCallback(() => {
        setState({ activeRecipeId: null, byRecipeId: {} });
        if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!state.activeRecipeId && tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
        }
    }, [state.activeRecipeId]);

    return (
        <SessionContext.Provider value={{ state, startSession, pauseResume, stopCurrentStep, getByRecipe, clearSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error("useSession must be used within SessionProvider");
    return ctx;
}
