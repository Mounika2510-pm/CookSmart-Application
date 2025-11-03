import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { toggleFavorite, deleteRecipe } from "../features/receipes/recipesSlice";
import { useNavigate } from "react-router-dom";
import type { Recipe } from "../features/receipes/types";
import "../styles/RecipesList.css";

const GridItem = Grid as unknown as React.FC<
  React.ComponentProps<typeof Grid> & {
    item?: boolean;
    container?: boolean;
  }
>;

export default function RecipesList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recipes = useSelector((state: RootState) => state.recipes.list);
  const [filterDifficulties, setFilterDifficulties] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const visibleRecipes = useMemo(() => {
    let result = [...recipes];

    if (filterDifficulties.length > 0) {
      result = result.filter((r) => filterDifficulties.includes(r.difficulty));
    }

    result.sort((a, b) =>
      sortOrder === "asc"
        ? (a.totalTimeMinutes ?? 0) - (b.totalTimeMinutes ?? 0)
        : (b.totalTimeMinutes ?? 0) - (a.totalTimeMinutes ?? 0)
    );

    return result;
  }, [recipes, filterDifficulties, sortOrder]);

  function handleToggleFavorite(id: string) {
    dispatch(toggleFavorite(id));
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this recipe?")) {
      dispatch(deleteRecipe(id));
    }
  }

  return (
    <Container maxWidth="lg" className="recipes-page">
      <div className="recipes-header">
        <h2 className="recipes-title">Recipes</h2>
        <div className="recipes-controls">
          <FormControl className="form-control">
            <InputLabel id="filter-diff">Filter Difficulty</InputLabel>
            <Select
              labelId="filter-diff"
              label="Filter Difficulty"
              multiple
              value={filterDifficulties}
              onChange={(e) =>
                setFilterDifficulties(
                  typeof e.target.value === "string"
                    ? e.target.value.split(",")
                    : e.target.value
                )
              }
              renderValue={(selected) => selected.join(", ")}
            >
              {["Easy", "Medium", "Hard"].map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="form-control">
            <InputLabel id="sort-order">Sort by Time</InputLabel>
            <Select
              labelId="sort-order"
              label="Sort by Time"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            className="create-btn"
            onClick={() => navigate("/create")}
          >
            + Create Recipe
          </Button>
        </div>
      </div>

      {visibleRecipes.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No recipes found. Try adding one!
        </Typography>
      ) : (
        <GridItem container spacing={3} className="recipes-grid">
          {visibleRecipes.map((recipe: Recipe) => (
            <GridItem item xs={12} sm={6} md={4} key={recipe.id}>
              <Card className="recipe-card">
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography className="recipe-name">{recipe.title}</Typography>
                    <IconButton
                      onClick={() => handleToggleFavorite(recipe.id)}
                      color={recipe.isFavorite ? "error" : "default"}
                    >
                      {recipe.isFavorite ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Stack>

                  <Typography className="recipe-meta">
                    Difficulty: {recipe.difficulty}
                  </Typography>

                  <Typography className="recipe-meta">
                    🕒 {recipe.totalTimeMinutes ?? 0} mins | 🍳{" "}
                    {recipe.totalIngredients ?? 0} ingredients
                  </Typography>
                  <Typography className="recipe-meta">
                    Complexity score: {recipe.complexityScore ?? 0}
                  </Typography>
                </CardContent>

                <CardActions className="recipe-actions">
                  <Button size="small" onClick={() => navigate(`/cook/${recipe.id}`)}>
                    Start Cooking
                  </Button>
                  <Button size="small" onClick={() => navigate(`/create?id=${recipe.id}`)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </GridItem>
          ))}
        </GridItem>
      )}
    </Container>
  );
}
