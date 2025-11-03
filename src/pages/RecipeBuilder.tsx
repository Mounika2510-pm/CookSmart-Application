import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Snackbar,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type {
  Difficulty,
  Recipe,
  Ingredient,
  RecipeStep,
} from "../features/receipes/types";
import { useDispatch, useSelector } from "react-redux";
import { addRecipe, updateRecipe } from "../features/receipes/recipesSlice";
import { useSearchParams } from "react-router-dom";
import type { RootState } from "../app/store";
import "../styles/RecipeBuilder.css";

function generateId() {
  return "id-" + Math.random().toString(36).slice(2, 9) + "-" + Date.now();
}

const baseMap: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export default function RecipeBuilder() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const recipeToEdit = useSelector((state: RootState) =>
    editId ? state.recipes.list.find((r) => r.id === editId) : undefined
  );

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingName, setIngName] = useState("");
  const [ingQty, setIngQty] = useState<number | "">("");
  const [ingUnit, setIngUnit] = useState("");
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [stepDesc, setStepDesc] = useState("");
  const [stepType, setStepType] = useState<"cooking" | "instruction">("instruction");
  const [stepDuration, setStepDuration] = useState<number | "">("");
  const [temperature, setTemperature] = useState<number | "">("");
  const [speed, setSpeed] = useState<number | "">("");
  const [selectedIngIds, setSelectedIngIds] = useState<string[]>([]);
  const [titleTouched, setTitleTouched] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    if (recipeToEdit) {
      setTitle(recipeToEdit.title);
      setDifficulty(recipeToEdit.difficulty);
      setIngredients(recipeToEdit.ingredients);
      setSteps(recipeToEdit.steps);
    }
  }, [recipeToEdit]);

  const totalTimeMinutes = useMemo(
    () => steps.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
    [steps]
  );
  const totalIngredients = ingredients.length;
  const complexityScore = useMemo(
    () => baseMap[difficulty] * Math.max(1, steps.length),
    [difficulty, steps.length]
  );

  const titleError =
    titleTouched && title.trim().length > 0 && title.trim().length < 3;
  const canSave =
    title.trim().length >= 3 && ingredients.length > 0 && steps.length > 0;

  function handleAddIngredient() {
    if (
      !ingName.trim() ||
      ingQty === "" ||
      Number(ingQty) <= 0 ||
      !ingUnit.trim()
    ) {
      setSnackMsg("Please fill ingredient details correctly (quantity > 0).");
      setSnackOpen(true);
      return;
    }

    const exists = ingredients.some(
      (ing) =>
        ing.name.toLowerCase() === ingName.trim().toLowerCase() &&
        ing.quantity === Number(ingQty) &&
        ing.unit.toLowerCase() === ingUnit.trim().toLowerCase()
    );
    if (exists) {
      setSnackMsg("Ingredient already exists.");
      setSnackOpen(true);
      return;
    }

    const newIng: Ingredient = {
      id: generateId(),
      name: ingName.trim(),
      quantity: Number(ingQty),
      unit: ingUnit.trim(),
    };
    setIngredients((prev) => [...prev, newIng]);
    setIngName("");
    setIngQty("");
    setIngUnit("");
  }

  function handleDeleteIngredient(id: string) {
    setSelectedIngIds((prev) => prev.filter((pid) => pid !== id));
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  function handleAddStep() {
    if (!stepDesc.trim() || stepDuration === "" || Number(stepDuration) <= 0) {
      setSnackMsg(
        "Please fill step description and positive duration (minutes)."
      );
      setSnackOpen(true);
      return;
    }

    const dur = Math.floor(Number(stepDuration));
    if (dur <= 0) {
      setSnackMsg("Duration must be an integer > 0.");
      setSnackOpen(true);
      return;
    }

    if (stepType === "cooking") {
      if (temperature === "" || speed === "") {
        setSnackMsg("Cooking step requires temperature and speed.");
        setSnackOpen(true);
        return;
      }
      const temp = Number(temperature);
      const sp = Number(speed);
      if (temp < 40 || temp > 200) {
        setSnackMsg("Temperature must be between 40 and 200°C.");
        setSnackOpen(true);
        return;
      }
      if (sp < 1 || sp > 5) {
        setSnackMsg("Speed must be between 1 and 5.");
        setSnackOpen(true);
        return;
      }
    }

    if (stepType === "instruction" && selectedIngIds.length === 0) {
      setSnackMsg("Instruction step requires at least one ingredient reference.");
      setSnackOpen(true);
      return;
    }

    const newStep: RecipeStep = {
      id: generateId(),
      description: stepDesc.trim(),
      type: stepType,
      durationMinutes: dur,
      ...(stepType === "cooking"
        ? {
          cookingSettings: {
            temperature: Number(temperature),
            speed: Number(speed),
          },
        }
        : { ingredientIds: selectedIngIds }),
    };

    setSteps((prev) => [...prev, newStep]);
    setStepDesc("");
    setStepDuration("");
    setTemperature("");
    setSpeed("");
    setSelectedIngIds([]);
  }

  function handleDeleteStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStepUp(index: number) {
    if (index === 0) return;
    setSteps((prev) => {
      const a = [...prev];
      [a[index - 1], a[index]] = [a[index], a[index - 1]];
      return a;
    });
  }

  function moveStepDown(index: number) {
    setSteps((prev) => {
      if (index === prev.length - 1) return prev;
      const a = [...prev];
      [a[index + 1], a[index]] = [a[index], a[index + 1]];
      return a;
    });
  }

  function handleSaveRecipe() {
    if (title.trim().length < 3) {
      setSnackMsg("Title must be at least 3 characters.");
      setSnackOpen(true);
      setTitleTouched(true);
      return;
    }

    if (!canSave) {
      setSnackMsg("Please complete Title, Ingredients and Steps before saving.");
      setSnackOpen(true);
      return;
    }

    if (recipeToEdit && editId) {
      const updated: Recipe = {
        ...recipeToEdit,
        title: title.trim(),
        difficulty,
        ingredients,
        steps,
        totalTimeMinutes,
        totalIngredients,
        complexityScore,
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateRecipe(updated));
      setSnackMsg("Recipe updated successfully!");
      setSnackOpen(true);
      return;
    }

    const newRecipe: Recipe = {
      id: generateId(),
      title: title.trim(),
      difficulty,
      ingredients,
      steps,
      totalTimeMinutes,
      totalIngredients,
      complexityScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addRecipe(newRecipe));
    setSnackMsg("Recipe saved successfully!");
    setSnackOpen(true);

    setTitle("");
    setDifficulty("Easy");
    setIngredients([]);
    setSteps([]);
    setTitleTouched(false);
  }

  function handleReset() {
    if (recipeToEdit) {
      setTitle(recipeToEdit.title);
      setDifficulty(recipeToEdit.difficulty);
      setIngredients(recipeToEdit.ingredients);
      setSteps(recipeToEdit.steps);
    } else {
      setTitle("");
      setDifficulty("Easy");
      setIngredients([]);
      setSteps([]);
    }
    setTitleTouched(false);
  }

  return (
    <Container maxWidth="md" className="recipe-builder-page">
      <Typography variant="h4" className="builder-title" gutterBottom>
        {recipeToEdit ? "Edit Recipe" : "Create / Edit Recipe"}
      </Typography>

      <Paper className="builder-paper">
        <Typography variant="h6" className="builder-section-title">
          Basic Info
        </Typography>

        <Box sx={{ display: "grid", gap: 2, mb: 3 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleTouched(true);
            }}
            error={titleError}
            helperText={
              title.trim().length === 0 && !titleTouched
                ? "No title added yet..."
                : titleError
                  ? "Title must be at least 3 characters."
                  : " "
            }
            fullWidth
          />

          <FormControl>
            <InputLabel id="difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="difficulty-label"
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <MenuItem value="Easy">Easy</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Hard">Hard</MenuItem>
            </Select>
            <FormHelperText>Choose recipe difficulty</FormHelperText>
          </FormControl>

          <Box>
            <Typography variant="subtitle2">Derived Fields</Typography>
            <Typography variant="body2">
              Total time: {totalTimeMinutes} mins
            </Typography>
            <Typography variant="body2">
              Total ingredients: {totalIngredients}
            </Typography>
            <Typography variant="body2">
              Complexity score: {complexityScore}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" className="builder-section-title">
          Ingredients
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Name"
            value={ingName}
            onChange={(e) => setIngName(e.target.value)}
          />
          <TextField
            label="Quantity"
            type="number"
            value={ingQty}
            onChange={(e) =>
              setIngQty(e.target.value ? Number(e.target.value) : "")
            }
          />
          <TextField
            label="Unit"
            value={ingUnit}
            onChange={(e) => setIngUnit(e.target.value)}
          />
          <Button variant="contained" className="orange-btn" onClick={handleAddIngredient}>
            Add
          </Button>
        </Stack>

        <Box sx={{ mb: 3 }}>
          {ingredients.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No ingredients added yet
            </Typography>
          ) : (
            ingredients.map((ing) => (
              <Stack
                key={ing.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                className="item-card"
              >
                <Typography>
                  {ing.name} — {ing.quantity} {ing.unit}
                </Typography>
                <IconButton onClick={() => handleDeleteIngredient(ing.id)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" className="builder-section-title">
          Steps
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <TextField
            label="Description"
            value={stepDesc}
            onChange={(e) => setStepDesc(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ width: 160 }}>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              label="Type"
              value={stepType}
              onChange={(e) =>
                setStepType(e.target.value as "cooking" | "instruction")
              }
            >
              <MenuItem value="instruction">Instruction</MenuItem>
              <MenuItem value="cooking">Cooking</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Duration (min)"
            type="number"
            value={stepDuration}
            onChange={(e) =>
              setStepDuration(e.target.value ? Number(e.target.value) : "")
            }
            sx={{ width: 160 }}
          />
        </Stack>

        {stepType === "cooking" && (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Temperature (°C)"
              type="number"
              value={temperature}
              onChange={(e) =>
                setTemperature(e.target.value ? Number(e.target.value) : "")
              }
            />
            <TextField
              label="Speed (1–5)"
              type="number"
              value={speed}
              onChange={(e) =>
                setSpeed(e.target.value ? Number(e.target.value) : "")
              }
            />
          </Stack>
        )}

        {stepType === "instruction" && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select ingredients used in this step:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {ingredients.map((ing) => {
                const selected = selectedIngIds.includes(ing.id);
                return (
                  <Button
                    key={ing.id}
                    size="small"
                    variant={selected ? "contained" : "outlined"}
                    onClick={() =>
                      setSelectedIngIds((prev) =>
                        selected
                          ? prev.filter((id) => id !== ing.id)
                          : [...prev, ing.id]
                      )
                    }
                  >
                    {ing.name}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        )}

        <Button
          variant="contained"
          className="orange-btn"
          onClick={handleAddStep}
          sx={{ mb: 2 }}
        >
          Add Step
        </Button>

        <Box>
          {steps.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No steps added yet
            </Typography>
          ) : (
            steps.map((s, idx) => (
              <Stack
                key={s.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                className="item-card"
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  Step {idx + 1}: {s.description} ({s.type}) —{" "}
                  {s.durationMinutes} min
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={idx === 0}
                    onClick={() => moveStepUp(idx)}
                  >
                    ↑
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    disabled={idx === steps.length - 1}
                    onClick={() => moveStepDown(idx)}
                  >
                    ↓
                  </Button>

                  <IconButton onClick={() => handleDeleteStep(s.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            ))
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" className="outline-btn" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="contained"
            className="orange-btn"
            onClick={handleSaveRecipe}
            disabled={!canSave}
          >
            {recipeToEdit ? "Update Recipe" : "Save Recipe"}
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={snackOpen}
        onClose={() => setSnackOpen(false)}
        message={snackMsg}
        autoHideDuration={3000}
      />
    </Container>
  );
}
