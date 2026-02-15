
import { NutrientGoal, UserProfile, FoodItem } from './types';

export const DEFAULT_GOALS: NutrientGoal[] = [
  { label: 'Calories', key: 'calories', unit: 'kcal', goal: 2000, color: 'bg-slate-800', icon: 'fa-fire', description: 'Total daily energy intake.' },
  { label: 'Protein', key: 'protein', unit: 'g', goal: 60, color: 'bg-emerald-500', icon: 'fa-dumbbell', description: 'Essential for muscle repair and enzyme production.' },
  { label: 'Fiber', key: 'fiber', unit: 'g', goal: 30, color: 'bg-teal-600', icon: 'fa-leaf', description: 'Crucial for digestive health and blood sugar control.' },
  { label: 'Iron', key: 'iron', unit: 'mg', goal: 18, color: 'bg-rose-700', icon: 'fa-magnet', description: 'Transports oxygen in your blood. Vital for energy.' },
  { label: 'Calcium', key: 'calcium', unit: 'mg', goal: 1000, color: 'bg-sky-500', icon: 'fa-bone', description: 'Maintains bone density and nerve signaling.' },
  { label: 'Vitamin B12', key: 'vitaminB12', unit: 'mcg', goal: 2.4, color: 'bg-indigo-600', icon: 'fa-brain', description: 'Vital for nerve tissue health and brain function.' },
  { label: 'Vitamin D', key: 'vitaminD', unit: 'IU', goal: 600, color: 'bg-amber-500', icon: 'fa-sun', description: 'Supports immune system and bone health.' },
  { label: 'Zinc', key: 'zinc', unit: 'mg', goal: 11, color: 'bg-indigo-400', icon: 'fa-shield-halved', description: 'Supports immune function and DNA synthesis.' },
  { label: 'Carbs', key: 'carbs', unit: 'g', goal: 250, color: 'bg-orange-400', icon: 'fa-wheat-awn', description: 'Primary energy source for the body.' },
  { label: 'Fats', key: 'fats', unit: 'g', goal: 70, color: 'bg-yellow-500', icon: 'fa-droplet', description: 'Used for hormone production and nutrient absorption.' },
];

export const FOOD_DATABASE: FoodItem[] = [
  // --- PROTEIN FOCUS ---
  { id: 'p1', name: 'Tofu (Extra Firm, 100g)', dietType: 'vegan', nutrients: { calories: 83, protein: 10, carbs: 2, fats: 5, fiber: 1, iron: 2, calcium: 350, vitaminB12: 0, vitaminD: 100, zinc: 1.6 } },
  { id: 'p2', name: 'Grilled Paneer (100g)', dietType: 'vegetarian', nutrients: { calories: 265, protein: 18, carbs: 1, fats: 20, fiber: 0, iron: 0.2, calcium: 208, vitaminB12: 0.1, vitaminD: 0, zinc: 2.5 } },
  { id: 'p3', name: 'Boiled Eggs (2 large)', dietType: 'egg', nutrients: { calories: 156, protein: 13, carbs: 1.2, fats: 11, fiber: 0, iron: 1.2, calcium: 50, vitaminB12: 1.2, vitaminD: 88, zinc: 1.1 } },
  { id: 'p4', name: 'Chicken Breast (100g)', dietType: 'non-veg', nutrients: { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, iron: 1, calcium: 15, vitaminB12: 0.3, vitaminD: 0, zinc: 1.0 } },
  { id: 'p5', name: 'Chickpeas (1 Cup)', dietType: 'vegan', nutrients: { calories: 269, protein: 15, carbs: 45, fats: 4, fiber: 12, iron: 4.7, calcium: 80, vitaminB12: 0, vitaminD: 0, zinc: 2.5 } },

  // --- IRON FOCUS ---
  { id: 'i1', name: 'Cooked Spinach (1 Cup)', dietType: 'vegan', nutrients: { calories: 41, protein: 5, carbs: 7, fats: 0.5, fiber: 4.3, iron: 6.4, calcium: 245, vitaminB12: 0, vitaminD: 0, zinc: 0.8 } },
  { id: 'i2', name: 'Lentils (Cooked, 1 Cup)', dietType: 'vegan', nutrients: { calories: 230, protein: 18, carbs: 40, fats: 0.8, fiber: 16, iron: 6.6, calcium: 38, vitaminB12: 0, vitaminD: 0, zinc: 2.4 } },
  { id: 'i3', name: 'Dates (5 pcs)', dietType: 'vegan', nutrients: { calories: 133, protein: 1, carbs: 36, fats: 0.2, fiber: 3.3, iron: 1.5, calcium: 32, vitaminB12: 0, vitaminD: 0, zinc: 0.3 } },
  { id: 'i4', name: 'Lean Beef (100g)', dietType: 'non-veg', nutrients: { calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, iron: 2.7, calcium: 18, vitaminB12: 2.6, vitaminD: 7, zinc: 4.8 } },

  // --- FIBER FOCUS ---
  { id: 'f1', name: 'Oats (Cooked, 1 Cup)', dietType: 'vegan', nutrients: { calories: 150, protein: 6, carbs: 27, fats: 3, fiber: 4, iron: 1.7, calcium: 20, vitaminB12: 0, vitaminD: 0, zinc: 1.0 } },
  { id: 'f2', name: 'Brown Rice (1 Cup)', dietType: 'vegan', nutrients: { calories: 218, protein: 4.5, carbs: 46, fats: 1.6, fiber: 3.5, iron: 0.8, calcium: 20, vitaminB12: 0, vitaminD: 0, zinc: 1.2 } },
  { id: 'f3', name: 'Steamed Broccoli (1 Cup)', dietType: 'vegan', nutrients: { calories: 55, protein: 3.7, carbs: 11, fats: 0.6, fiber: 5.1, iron: 1, calcium: 62, vitaminB12: 0, vitaminD: 0, zinc: 0.4 } },
  { id: 'f4', name: 'Large Apple (with skin)', dietType: 'vegan', nutrients: { calories: 116, protein: 0.6, carbs: 31, fats: 0.4, fiber: 5.4, iron: 0.3, calcium: 13, vitaminB12: 0, vitaminD: 0, zinc: 0.1 } },

  // --- CALCIUM FOCUS ---
  { id: 'c1', name: 'Whole Milk (1 Cup)', dietType: 'vegetarian', nutrients: { calories: 149, protein: 8, carbs: 12, fats: 8, fiber: 0, iron: 0.1, calcium: 300, vitaminB12: 1.1, vitaminD: 120, zinc: 1.0 } },
  { id: 'c2', name: 'Sesame Seeds (2 tbsp)', dietType: 'vegan', nutrients: { calories: 104, protein: 3.2, carbs: 4.2, fats: 9, fiber: 2.1, iron: 2.6, calcium: 176, vitaminB12: 0, vitaminD: 0, zinc: 1.4 } },
  { id: 'c3', name: 'Almonds (28g)', dietType: 'vegan', nutrients: { calories: 164, protein: 6, carbs: 6, fats: 14, fiber: 3.5, iron: 1.1, calcium: 76, vitaminB12: 0, vitaminD: 0, zinc: 0.9 } },

  // --- VITAMIN B12 / D FOCUS ---
  { id: 'b1', name: 'Salmon Fillet (100g)', dietType: 'non-veg', nutrients: { calories: 208, protein: 22, carbs: 0, fats: 13, fiber: 0, iron: 0.3, calcium: 9, vitaminB12: 2.8, vitaminD: 526, zinc: 0.4 } },
  { id: 'b2', name: 'Nutritional Yeast (2 tbsp)', dietType: 'vegan', nutrients: { calories: 45, protein: 8, carbs: 3, fats: 0.5, fiber: 4, iron: 0.5, calcium: 10, vitaminB12: 15, vitaminD: 0, zinc: 2.0 } },
  { id: 'b3', name: 'UV Mushrooms (100g)', dietType: 'vegan', nutrients: { calories: 22, protein: 3, carbs: 3, fats: 0.3, fiber: 1, iron: 0.5, calcium: 5, vitaminB12: 0, vitaminD: 400, zinc: 0.5 } },
  { id: 'b4', name: 'Sardines (100g)', dietType: 'non-veg', nutrients: { calories: 208, protein: 25, carbs: 0, fats: 11, fiber: 0, iron: 2.9, calcium: 382, vitaminB12: 8.9, vitaminD: 270, zinc: 1.3 } },
];

export const calculatePersonalizedGoals = (profile: UserProfile, baseGoals: NutrientGoal[]): NutrientGoal[] => {
  const multipliers = { low: 28, moderate: 33, high: 38 };
  const dailyCals = profile.weight * multipliers[profile.activityLevel];
  const proteinGrams = profile.weight * (profile.activityLevel === 'high' ? 2.0 : 1.6);
  
  return baseGoals.map(goal => {
    if (goal.key === 'calories') return { ...goal, goal: Math.round(dailyCals) };
    if (goal.key === 'protein') return { ...goal, goal: Math.round(proteinGrams) };
    if (goal.key === 'carbs') return { ...goal, goal: Math.round(dailyCals * 0.5 / 4) };
    if (goal.key === 'fats') return { ...goal, goal: Math.round(dailyCals * 0.25 / 9) };
    return goal;
  });
};
