import { Platform } from "react-native";

// If you ever deploy to a physical device running Expo Go,
// replace the localhost/10.0.2.2 with your computer's local IPv4 Address (e.g., "192.168.1.10")
const BASE_URL = "http://10.180.58.251:8000";

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }
  return data;
};

export const api = {
  // --- AUTH ENDPOINTS ---
  register: async (fullName, email, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
      }),
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // --- NUTRITIONAL TARGETS ENDPOINTS ---
  saveTargets: async (userId, gender, age, weight, height, computedTargets) => {
    const response = await fetch(`${BASE_URL}/api/user/targets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        gender: gender.toLowerCase(),
        age: parseInt(age, 10),
        weight: parseFloat(weight),
        height: parseInt(height, 10),
        calories: parseInt(computedTargets.calories, 10),
        carbs: parseInt(computedTargets.carbs, 10),
        protein: parseInt(computedTargets.protein, 10),
        fats: parseInt(computedTargets.fats, 10),
      }),
    });
    return handleResponse(response);
  },

  // --- MEAL LOGGING ENDPOINTS ---
  fetchTodaysMeals: async (userId) => {
    const response = await fetch(`${BASE_URL}/api/meals/today/${userId}`);
    return handleResponse(response);
  },

  // Added this clean alias method so HomeScreen.js connects flawlessly
  getDailyMeals: async (userId) => {
    const response = await fetch(`${BASE_URL}/api/meals/today/${userId}`);
    return handleResponse(response);
  },

  fetchMealsHistory: async (userId) => {
    const response = await fetch(`${BASE_URL}/api/meals/history/${userId}`);
    return handleResponse(response);
  },

  logMeal: async (
    userId,
    mealType,
    name,
    calories,
    carbs,
    protein,
    fats,
    isAi = false,
  ) => {
    const parsedCalories = Math.round(calories || 0);
    const parsedCarbs = Math.round(carbs || 0);
    const parsedProtein = Math.round(protein || 0);
    const parsedFats = Math.round(fats || 0);
    const isAiString = isAi ? "true" : "false";

    // 🔑 FIXED: Wired the URL templates to map the standardized type casting variables explicitly
    const url = `${BASE_URL}/api/meals?user_id=${userId}&meal_type=${encodeURIComponent(mealType)}&name=${encodeURIComponent(name)}&calories=${parsedCalories}&carbs=${parsedCarbs}&protein=${parsedProtein}&fats=${parsedFats}&is_ai=${isAiString}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    return handleResponse(response);
  },

  // --- COMPUTER VISION PIPELINE ---
  uploadAndScanPlate: async (imageUri) => {
    const formData = new FormData();
    const uriParts = imageUri.split("/");
    const fileName = uriParts[uriParts.length - 1];
    const fileType = fileName.split(".").pop();

    // 🔑 FIXED: Standardize local file caching scheme explicitly for Android filesystem operations
    let cleanAndroidUri = imageUri;
    if (Platform.OS === "android" && !imageUri.startsWith("file://")) {
      cleanAndroidUri = `file://${imageUri}`;
    }

    formData.append("file", {
      uri:
        Platform.OS === "android"
          ? cleanAndroidUri
          : imageUri.replace("file://", ""),
      name: fileName,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    });

    const response = await fetch(`${BASE_URL}/api/scan`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        // Content-Type is omitted completely to let fetch build boundaries cleanly
      },
      body: formData,
    });
    return handleResponse(response);
  },
};
