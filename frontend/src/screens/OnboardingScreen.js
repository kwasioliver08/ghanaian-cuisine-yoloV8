import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { calculateDailyTargets } from "../utils/nutritionCalculations";
import { isValidNumericInput } from "../utils/validation";
// --- IMPORT THE LIVE API HELPER ---
import { api } from "../utils/api";

/**
 * OnboardingScreen Component
 * Collects user profile metrics and calculates daily nutritional targets
 * Uses Harris-Benedict equation and West African macronutrient distribution
 */
const OnboardingScreen = ({
  onOnboardingComplete,
  onCancel,
  userProfile,
  currentTargets,
  currentDetails,
  isEditingMacroAllocation,
  showNotification, // 🔑 Destructured global toast notification channel trigger
}) => {
  // 🔑 INITIALIZATIONS: Pre-populate states instantly if parent states exist
  const [gender, setGender] = useState(currentDetails?.gender || null);
  const [age, setAge] = useState(
    currentDetails?.age ? String(currentDetails.age) : "",
  );
  const [weight, setWeight] = useState(
    currentDetails?.weight ? String(currentDetails.weight) : "",
  );
  const [height, setHeight] = useState(
    currentDetails?.height ? String(currentDetails.height) : "",
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * 🔑 MOUNT TRIGGER EFFECT HANDSHAKE:
   * Dynamically tracks incoming parameters if a user switches contexts to edit mode midway
   */
  useEffect(() => {
    if (currentDetails) {
      if (currentDetails.gender) setGender(currentDetails.gender);
      if (currentDetails.age) setAge(String(currentDetails.age));
      if (currentDetails.weight) setWeight(String(currentDetails.weight));
      if (currentDetails.height) setHeight(String(currentDetails.height));
    }
  }, [currentDetails]);

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
      // 1. Calculate the final targets using your West African nutrition split logic
      const dailyTargets = calculateDailyTargets(
        parseFloat(weight),
        parseInt(height, 10),
        parseInt(age, 10),
        gender,
      );

      // 2. Fire the database call to POST /api/user/targets
      // Type casting matches PostgreSQL expectations strictly
      await api.saveTargets(
        userProfile.id,
        gender.toLowerCase(), // Backend expects lower_case string ('male' / 'female')
        parseInt(age, 10), // Cast string to standard integer
        parseFloat(weight), // Cast string to standard float
        parseInt(height, 10), // Cast string to standard integer
        dailyTargets,
      );

      // 3. Update the global state inside App.js
      if (onOnboardingComplete) {
        onOnboardingComplete({
          computedTargets: dailyTargets,
          details: {
            gender,
            age: parseInt(age, 10),
            weight: parseFloat(weight),
            height: parseInt(height, 10),
          },
        });
      }
    } catch (error) {
      // 🔑 FIXED: Replaced native prompt layout entirely with unified custom toast engine alerts
      if (showNotification) {
        showNotification(
          error.message || "Failed to complete metric configuration",
          "error",
        );
      }
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
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            {isEditingMacroAllocation ? "EDIT MACRO ALLOCATION" : "SETUP FLOW"}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>
            {isEditingMacroAllocation ? "Update Your Targets" : "Your Profile"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditingMacroAllocation
              ? "Review the values you already have, then update them if needed."
              : "Let's calculate your daily nutritional targets"}
          </Text>
        </View>

        {isEditingMacroAllocation && currentDetails && (
          <View style={styles.currentTargetsCard}>
            <Text style={styles.currentTargetsTitle}>Current Details</Text>
            <View style={styles.currentTargetsRow}>
              <View style={styles.currentTargetChip}>
                <Text style={styles.currentTargetLabel}>Gender</Text>
                <Text style={styles.currentTargetValue}>
                  {currentDetails.gender || "Not set"}
                </Text>
              </View>
              <View style={styles.currentTargetChip}>
                <Text style={styles.currentTargetLabel}>Age</Text>
                <Text style={styles.currentTargetValue}>
                  {currentDetails.age
                    ? `${currentDetails.age} years`
                    : "Not set"}
                </Text>
              </View>
            </View>
            <View style={styles.currentTargetsRow}>
              <View style={styles.currentTargetChip}>
                <Text style={styles.currentTargetLabel}>Weight</Text>
                <Text style={styles.currentTargetValue}>
                  {currentDetails.weight
                    ? `${currentDetails.weight} kg`
                    : "Not set"}
                </Text>
              </View>
              <View style={styles.currentTargetChip}>
                <Text style={styles.currentTargetLabel}>Height</Text>
                <Text style={styles.currentTargetValue}>
                  {currentDetails.height
                    ? `${currentDetails.height} cm`
                    : "Not set"}
                </Text>
              </View>
            </View>
          </View>
        )}

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
              {loading
                ? "Saving..."
                : isEditingMacroAllocation
                  ? "Save Changes"
                  : "Complete Setup"}
            </Text>
          </TouchableOpacity>

          {isEditingMacroAllocation && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel and Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },
  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    marginTop: 4,
    marginBottom: 12,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 1,
  },
  headerSection: {
    marginBottom: 28,
    marginTop: 18,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  currentTargetsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.95)",
    padding: 16,
    marginBottom: 18,
  },
  currentTargetsTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  currentTargetsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  currentTargetChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  currentTargetLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  currentTargetValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E0D8",
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    alignItems: "center",
    marginRight: 6,
  },
  genderButtonActive: {
    borderColor: "#1F2937",
    backgroundColor: "#1F2937",
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  genderButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E0D8",
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    fontSize: 15,
    color: "#1F2937",
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
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E7E0D8",
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
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
    color: "#4B5563",
    fontWeight: "500",
  },
  targetValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#E7E0D8",
    marginVertical: 8,
  },
  previewNote: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 12,
  },
  completeButton: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    alignItems: "center",
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
});

export default OnboardingScreen;
