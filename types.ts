
export type NutrientData = Record<string, number>;

export type DietType = 'vegan' | 'vegetarian' | 'eggitarian' | 'non-veg';
export type FoodCategory = 'vegan' | 'vegetarian' | 'egg' | 'non-veg';

export interface FoodItem {
  id: string;
  name: string;
  nutrients: NutrientData;
  dietType: FoodCategory;
}

export interface NutrientGoal {
  label: string;
  key: string;
  unit: string;
  goal: number;
  color: string;
  icon: string;
  description: string;
  isCustom?: boolean;
}

export type ActivityLevel = 'low' | 'moderate' | 'high';

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  activityLevel: ActivityLevel;
  dietType: DietType;
}

export interface DailyHistoryEntry {
  date: string; // YYYY-MM-DD
  totals: NutrientData;
  water: number;
}

export type HistoryMap = Record<string, DailyHistoryEntry>;
