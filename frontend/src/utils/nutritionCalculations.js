/**
 * Nutritional Calculation Utilities
 * Implements Harris-Benedict BMR equation and West African macronutrient distribution
 */

/**
 * Calculate Basal Metabolic Rate (BMR) using Harris-Benedict Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'Male' or 'Female'
 * @returns {number} BMR in kcal/day
 */
export const calculateBMR = (weight, height, age, gender) => {
  let bmr;

  if (gender === "Male") {
    // Men: BMR = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else if (gender === "Female") {
    // Women: BMR = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  } else {
    throw new Error('Gender must be either "Male" or "Female"');
  }

  return Math.round(bmr);
};

/**
 * Calculate daily caloric target using sedentary activity factor (1.2)
 * @param {number} bmr - Basal Metabolic Rate in kcal/day
 * @returns {number} Daily caloric target in kcal
 */
export const calculateDailyCalories = (bmr) => {
  const SEDENTARY_FACTOR = 1.2;
  return Math.round(bmr * SEDENTARY_FACTOR);
};

/**
 * Distribute macronutrients based on West African nutritional split
 * 55% Carbohydrates, 20% Protein, 25% Fats
 * @param {number} dailyCalories - Daily caloric target
 * @returns {object} Macronutrient targets {carbs, protein, fats} in grams
 */
export const calculateMacronutrients = (dailyCalories) => {
  // Calorie allocation percentages
  const CARB_PERCENTAGE = 0.55;
  const PROTEIN_PERCENTAGE = 0.2;
  const FAT_PERCENTAGE = 0.25;

  // Calories per gram
  const CARB_CALORIE_DENSITY = 4; // kcal/g
  const PROTEIN_CALORIE_DENSITY = 4; // kcal/g
  const FAT_CALORIE_DENSITY = 9; // kcal/g

  // Calculate macro calories
  const carbCalories = dailyCalories * CARB_PERCENTAGE;
  const proteinCalories = dailyCalories * PROTEIN_PERCENTAGE;
  const fatCalories = dailyCalories * FAT_PERCENTAGE;

  // Convert to grams
  return {
    calories: dailyCalories,
    carbs: Math.round(carbCalories / CARB_CALORIE_DENSITY),
    protein: Math.round(proteinCalories / PROTEIN_CALORIE_DENSITY),
    fats: Math.round(fatCalories / FAT_CALORIE_DENSITY),
  };
};

/**
 * Calculate complete daily nutritional targets
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'Male' or 'Female'
 * @returns {object} Complete daily targets object
 */
export const calculateDailyTargets = (weight, height, age, gender) => {
  const bmr = calculateBMR(weight, height, age, gender);
  const dailyCalories = calculateDailyCalories(bmr);
  const macros = calculateMacronutrients(dailyCalories);

  return {
    gender,
    age,
    weight,
    height,
    bmr,
    ...macros,
  };
};
