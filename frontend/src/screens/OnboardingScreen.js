import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { calculateDailyTargets } from "../utils/nutritionCalculations";
import { isValidNumericInput } from "../utils/validation";

/**
 * OnboardingScreen Component
 * Collects user profile metrics and calculates daily nutritional targets
 * Uses Harris-Benedict equation and West African macronutrient distribution
 */
const OnboardingScreen = ({ onOnboardingComplete, userProfile }) => {
  const [gender, setGender] = useState(null); // 'Male' or 'Female'
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState(""); // kg
  const [height, setHeight] = useState(""); // cm
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Calculate daily targets in real-time for an on-screen preview card
   */
  const calculatedTargets = useMemo(() => {
    if (gender && age && weight && height) {
      try {
        const ageNum = parseInt(age, 10);
        const weightNum = parseFloat(weight);
        const heightNum = parseInt(height, 10);

        if (ageNum > 0 && weightNum > 0 && heightNum > 0) {
          return calculateDailyTargets(weightNum, heightNum, ageNum, gender);
        }
      } catch (error) {
        // Silent catch during raw character inputs
      }
    }
    return null;
  }, [gender, age, weight, height]);

  /**
   * Validate onboarding form input values locally
   */
  const validateForm = () => {
    const newErrors = {};

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!isValidNumericInput(age, 13, 120)) {
      newErrors.age = "Please enter a valid age (13-120)";
    }

    if (!isValidNumericInput(weight, 30, 300)) {
      newErrors.weight = "Please enter a valid weight in kg (30-300)";
    }

    if (!isValidNumericInput(height, 120, 250)) {
      newErrors.height = "Please enter a valid height in cm (120-250)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle onboarding complete submission
   */
  const handleComplete = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate rapid internal processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Build the final optimized macro payload structure
      const dailyTargets = calculateDailyTargets(
        parseFloat(weight),
        parseInt(height, 10),
        parseInt(age, 10),
        gender,
      );

      if (onOnboardingComplete) {
        onOnboardingComplete(dailyTargets);
      }
    } catch (error) {
      Alert.alert(
        "Setup Error",
        error.message || "Failed to complete metric configuration",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Let's calculate your daily nutritional targets
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Gender Selection */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.genderButtonGroup}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Male" && styles.genderButtonActive,
                ]}
                onPress={() => {
                  setGender("Male");
                  if (errors.gender) {
                    setErrors({ ...errors, gender: null });
                  }
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === "Male" && styles.genderButtonTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "Female" && styles.genderButtonActive,
                ]}
                onPress={() => {
                  setGender("Female");
                  if (errors.gender) {
                    setErrors({ ...errors, gender: null });
                  }
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === "Female" && styles.genderButtonTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          {/* Age Input */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Age (years)</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="Enter your age"
              placeholderTextColor="#A0AEC0"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (errors.age) {
                  setErrors({ ...errors, age: null });
                }
              }}
              keyboardType="number-pad"
              editable={!loading}
            />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          {/* Weight Input */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              placeholder="Enter your weight"
              placeholderTextColor="#A0AEC0"
              value={weight}
              onChangeText={(text) => {
                setWeight(text);
                if (errors.weight) {
                  setErrors({ ...errors, weight: null });
                }
              }}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            {errors.weight && (
              <Text style={styles.errorText}>{errors.weight}</Text>
            )}
          </View>

          {/* Height Input */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Height (cm)</Text>
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              placeholder="Enter your height"
              placeholderTextColor="#A0AEC0"
              value={height}
              onChangeText={(text) => {
                setHeight(text);
                if (errors.height) {
                  setErrors({ ...errors, height: null });
                }
              }}
              keyboardType="number-pad"
              editable={!loading}
            />
            {errors.height && (
              <Text style={styles.errorText}>{errors.height}</Text>
            )}
          </View>

          {/* Calculated Targets Preview */}
          {calculatedTargets && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Your Daily Targets</Text>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Calories</Text>
                <Text style={styles.targetValue}>
                  {calculatedTargets.calories} kcal
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Carbohydrates (55%)</Text>
                <Text style={styles.targetValue}>
                  {calculatedTargets.carbs}g
                </Text>
              </View>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Protein (20%)</Text>
                <Text style={styles.targetValue}>
                  {calculatedTargets.protein}g
                </Text>
              </View>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Fats (25%)</Text>
                <Text style={styles.targetValue}>
                  {calculatedTargets.fats}g
                </Text>
              </View>

              <Text style={styles.previewNote}>
                Based on Harris-Benedict equation with 1.2 sedentary activity
                factor
              </Text>
            </View>
          )}

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              loading && styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text style={styles.completeButtonText}>
              {loading ? "Saving..." : "Complete Setup"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 60,
  },
  headerSection: {
    marginBottom: 32,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  genderButtonGroup: {
    flexDirection: "row",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    marginRight: 6,
  },
  genderButtonActive: {
    borderColor: "#2D3748",
    backgroundColor: "#2D3748",
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A5568",
  },
  genderButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#2D3748",
  },
  inputError: {
    borderColor: "#F56565",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 12,
    color: "#C53030",
    marginTop: 6,
    fontWeight: "500",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  targetLabel: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "500",
  },
  targetValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  previewNote: {
    fontSize: 11,
    color: "#A0AEC0",
    fontStyle: "italic",
    marginTop: 12,
  },
  completeButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#2D3748",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default OnboardingScreen;
