export type ParsedRecipe = {
  type: "breakfast" | "lunch" | "dinner";
  title: string;
  totalTime: string;
  steps: {
    description: string;
    timeToComplete: string;
    ingredients: string[];
  }[];
}