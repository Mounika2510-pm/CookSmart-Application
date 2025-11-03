export type Difficulty = "Easy" | "Medium" | "Hard";

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type CookSettings = {
  temperature: number;
  speed: number;
};

export type RecipeStep = {
  id: string;
  description: string;
  type: "cooking" | "instruction";
  durationMinutes: number;
  cookingSettings?: CookSettings;
  ingredientIds?: string[];
};

export type Recipe = {
  id: string;
  title: string;
  cuisine?: string;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  totalTimeMinutes: number;
  totalIngredients: number;
  complexityScore: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
};
