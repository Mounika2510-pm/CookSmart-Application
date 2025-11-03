import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Stack,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar,
} from "@mui/material";
import type { Recipe } from "../features/receipes/types";
import { useSession } from "../features/session/SessionProvider";
import "../styles/CookingPage.css";

function formatMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipe = useSelector((s: RootState) =>
    s.recipes.list.find((r) => r.id === id)
  ) as Recipe | undefined;

  const { state, startSession, pauseResume, stopCurrentStep } = useSession();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        pauseResume();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pauseResume]);

  if (!recipe) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Recipe not found.
        </Typography>
        <Button onClick={() => navigate("/recipes")}>Back</Button>
      </Container>
    );
  }

  const sessionEntry = state.byRecipeId[recipe.id];
  const active = state.activeRecipeId === recipe.id;
  const totalDurationSec = recipe.steps.reduce(
    (acc, s) => acc + s.durationMinutes * 60,
    0
  );

  const handleStart = () => {
    const res = startSession(recipe);
    if (!res.ok) setToast(res.message ?? "Could not start session");
  };

  const timeline = useMemo(() => {
    return recipe.steps.map((s, idx) => {
      const status = sessionEntry
        ? idx < sessionEntry.currentStepIndex
          ? "Completed"
          : idx === sessionEntry.currentStepIndex
            ? "Current"
            : "Upcoming"
        : "Upcoming";
      return {
        idx,
        short: s.description.slice(0, 40),
        duration: s.durationMinutes,
        status,
      };
    });
  }, [recipe, sessionEntry]);

  const overallRemaining = sessionEntry
    ? sessionEntry.overallRemainingSec ?? 0
    : totalDurationSec;
  const overallElapsed = totalDurationSec - overallRemaining;
  const overallPercent = Math.round((overallElapsed / totalDurationSec) * 100);

  const currentStepIndex = sessionEntry ? sessionEntry.currentStepIndex : 0;
  const currentStep = recipe.steps[currentStepIndex];
  const stepTotalSec = currentStep.durationMinutes * 60;
  const stepRemaining = sessionEntry
    ? sessionEntry.stepRemainingSec ?? stepTotalSec
    : stepTotalSec;
  const stepElapsed = Math.max(0, stepTotalSec - stepRemaining);
  const stepPercent = Math.round((stepElapsed / stepTotalSec) * 100);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper className="popup-smooth" sx={{ p: 4 }}>
        <Typography variant="h4" align="center">
          {recipe.title}
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Difficulty: {recipe.difficulty} · Total time:{" "}
          {recipe.totalTimeMinutes} mins
        </Typography>

        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={overallPercent}
            sx={{ height: 10, borderRadius: 6 }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption">
              Overall remaining: {formatMMSS(overallRemaining)}
            </Typography>
            <Typography variant="caption">{overallPercent}%</Typography>
          </Stack>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress
                variant="determinate"
                value={stepPercent}
                size={64}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">
                  Step {currentStepIndex + 1} of {recipe.steps.length}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {currentStep.description}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: "block" }}
                >
                  Remaining: {formatMMSS(stepRemaining)}
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  {currentStep.type === "cooking" &&
                    currentStep.cookingSettings && (
                      <>
                        <Chip
                          size="small"
                          label={`Temp ${currentStep.cookingSettings.temperature}°C`}
                        />
                        <Chip
                          size="small"
                          label={`Speed ${currentStep.cookingSettings.speed}`}
                        />
                      </>
                    )}
                  {currentStep.type === "instruction" &&
                    currentStep.ingredientIds && (
                      <Chip
                        size="small"
                        label={`${currentStep.ingredientIds.length} ingredients`}
                      />
                    )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Timeline</Typography>
          <List dense>
            {timeline.map((r) => (
              <ListItem key={r.idx} divider>
                <ListItemText
                  primary={r.short}
                  secondary={`${r.duration} min — ${r.status}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center">
          {!active ? (
            <Button variant="contained" onClick={handleStart}>
              Start Session
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={() => pauseResume()}
                size="small"
              >
                {sessionEntry?.isRunning ? "Pause" : "Resume"}
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => stopCurrentStep()}
              >
                Stop
              </Button>
            </>
          )}
        </Stack>
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        message={toast}
        onClose={() => setToast(null)}
      />
    </Container>
  );
}
