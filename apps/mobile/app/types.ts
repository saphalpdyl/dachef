export type ParsedRecipe = {
  type: "breakfast" | "lunch" | "dinner";
  title: string;
  steps: {
    description: string;
    timeToComplete: string;
    ingredients: string[];
  }[];
}