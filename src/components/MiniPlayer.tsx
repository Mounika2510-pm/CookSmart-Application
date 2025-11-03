import { useSession } from "../features/session/SessionProvider";
import { useSelector } from "react-redux";
import { Box, Button, Typography, Paper, CircularProgress, Stack } from "@mui/material";
import type { RootState } from "../app/store";
import { useNavigate, useLocation } from "react-router-dom";

export default function MiniPlayer() {
    const { state, pauseResume, stopCurrentStep } = useSession();
    const navigate = useNavigate();
    const location = useLocation();
    const activeId = state.activeRecipeId;
    const recipe = useSelector((s: RootState) => (activeId ? s.recipes.list.find((r) => r.id === activeId) : undefined));

    const onCookRoute = location.pathname === `/cook/${activeId}`;

    if (!activeId || !recipe || onCookRoute) return null;

    const entry = state.byRecipeId[activeId];
    if (!entry) return null;

    const step = recipe.steps[entry.currentStepIndex];
    const stepTotal = step.durationMinutes * 60;
    const stepElapsed = Math.max(0, stepTotal - (entry.stepRemainingSec ?? 0));
    const stepProgress = Math.round((stepElapsed / stepTotal) * 100);

    const overallTotal = recipe.steps.reduce((acc, s) => acc + s.durationMinutes * 60, 0);
    const overallElapsed = overallTotal - (entry.overallRemainingSec ?? overallTotal);
    const overallPercent = Math.round((overallElapsed / overallTotal) * 100);

    return (
        <Paper sx={{ position: "fixed", right: 16, bottom: 16, zIndex: 1400, p: 1.5, minWidth: 260 }}>
            <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                <Box onClick={() => navigate(`/cook/${activeId}`)} sx={{ cursor: "pointer", flex: 1 }}>
                    <Typography variant="subtitle1" noWrap>{recipe.title}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress variant="determinate" size={36} value={stepProgress} aria-label={`Step progress ${stepProgress}%`} />
                        <Box>
                            <Typography variant="body2">{entry.isRunning ? "Running" : "Paused"}</Typography>
                            <Typography variant="caption">Step {entry.currentStepIndex + 1} · {Math.floor((entry.stepRemainingSec ?? 0) / 60)}:{String((entry.stepRemainingSec ?? 0) % 60).padStart(2, "0")}</Typography>
                        </Box>
                    </Stack>
                </Box>

                <Stack direction="column" spacing={1}>
                    <Button size="small" onClick={() => pauseResume()}>{entry.isRunning ? "Pause" : "Resume"}</Button>
                    <Button size="small" color="error" onClick={() => stopCurrentStep()}>STOP</Button>
                </Stack>
            </Stack>
            <Box sx={{ mt: 1 }}>
                <Typography variant="caption">Overall {overallPercent}%</Typography>
                <Box sx={{ height: 6, background: "#eee", borderRadius: 4, mt: 0.5 }}>
                    <Box sx={{ width: `${overallPercent}%`, height: "100%", bgcolor: "primary.main", borderRadius: 4 }} />
                </Box>
            </Box>
        </Paper>
    );
}
