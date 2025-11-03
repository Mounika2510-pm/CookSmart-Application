import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Recipe } from "./types";

const STORAGE_KEY = "recipes:v1";

function loadRecipes(): Recipe[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

interface RecipesState {
  list: Recipe[];
}

const initialState: RecipesState = {
  list: loadRecipes(),
};

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.list.push(action.payload);
      saveRecipes(state.list);
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.list.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
        saveRecipes(state.list);
      }
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((r) => r.id !== action.payload);
      saveRecipes(state.list);
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const recipe = state.list.find((r) => r.id === action.payload);
      if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
        saveRecipes(state.list);
      }
    },
  },
});

export const { addRecipe, updateRecipe, deleteRecipe, toggleFavorite } = recipesSlice.actions;
export default recipesSlice.reducer;
