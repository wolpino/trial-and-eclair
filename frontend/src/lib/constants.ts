export const STANDARD_UNITS = [
  { value: "", label: "— unit —" },
  { value: "teaspoon", label: "teaspoon" },
  { value: "tablespoon", label: "tablespoon" },
  { value: "fluid_ounce", label: "fluid ounce" },
  { value: "cup", label: "cup" },
  { value: "quart", label: "quart" },
  { value: "gallon", label: "gallon" },
  { value: "milliliter", label: "milliliter" },
  { value: "liter", label: "liter" },
  { value: "pound", label: "pound" },
  { value: "ounce", label: "ounce" },
  { value: "milligram", label: "milligram" },
  { value: "gram", label: "gram" },
  { value: "kilogram", label: "kilogram" },
  { value: "inch", label: "inch" },
  { value: "centimeter", label: "centimeter" },
  { value: "whole", label: "whole" },
] as const;

export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  cookbook: "Cookbook",
  blog: "Blog",
  chef: "Chef / Baker",
  article: "Article",
  tool: "Tool",
};
