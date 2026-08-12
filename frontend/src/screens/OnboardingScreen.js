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
  ImageBackground,
} from "react-native";
import { calculateDailyTargets } from "../utils/nutritionCalculations";
import { isValidNumericInput } from "../utils/validation";
import { api } from "../utils/api";

const OnboardingScreen = ({
  onOnboardingComplete,
  onCancel,
  userProfile,
  currentTargets,
  currentDetails,
  isEditingMacroAllocation,
  showNotification,
}) => {
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

  useEffect(() => {
    if (currentDetails) {
      if (currentDetails.gender) setGender(currentDetails.gender);
      if (currentDetails.age) setAge(String(currentDetails.age));
      if (currentDetails.weight) setWeight(String(currentDetails.weight));
      if (currentDetails.height) setHeight(String(currentDetails.height));
    }
  }, [currentDetails]);

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
        // Silent catch
      }
    }
    return null;
  }, [gender, age, weight, height]);

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

  const handleComplete = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dailyTargets = calculateDailyTargets(
        parseFloat(weight),
        parseInt(height, 10),
        parseInt(age, 10),
        gender,
      );

      await api.saveTargets(
        userProfile.id,
        gender.toLowerCase(),
        parseInt(age, 10),
        parseFloat(weight),
        parseInt(height, 10),
        dailyTargets,
      );

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
    <ImageBackground
      source={require("../../assets/onboarding_background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Pill Badge */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {isEditingMacroAllocation
                ? "EDIT MACRO ALLOCATION"
                : "SETUP FLOW"}
            </Text>
          </View>

          {/* Header Typography */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>
              {isEditingMacroAllocation
                ? "Update Your Targets"
                : "Your Profile"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditingMacroAllocation
                ? "Review the values you already have, then update them if needed."
                : "Let's calculate your daily nutritional targets"}
            </Text>
          </View>

          {/* Form Floating Card */}
          <View style={styles.formCard}>
            {/* Gender Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.label}>GENDER</Text>
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
                  activeOpacity={0.8}
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
                  activeOpacity={0.8}
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
              <Text style={styles.label}>AGE (YEARS)</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                placeholder="Enter your age"
                placeholderTextColor="#8C857B"
                value={age}
                onChangeText={(text) => {
                  setAge(text);
                  if (errors.age) setErrors({ ...errors, age: null });
                }}
                keyboardType="number-pad"
                editable={!loading}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            {/* Weight Input */}
            <View style={styles.sectionContainer}>
              <Text style={styles.label}>WEIGHT (KG)</Text>
              <TextInput
                style={[styles.input, errors.weight && styles.inputError]}
                placeholder="Enter your weight"
                placeholderTextColor="#8C857B"
                value={weight}
                onChangeText={(text) => {
                  setWeight(text);
                  if (errors.weight) setErrors({ ...errors, weight: null });
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
              <Text style={styles.label}>HEIGHT (CM)</Text>
              <TextInput
                style={[styles.input, errors.height && styles.inputError]}
                placeholder="Enter your height"
                placeholderTextColor="#8C857B"
                value={height}
                onChangeText={(text) => {
                  setHeight(text);
                  if (errors.height) setErrors({ ...errors, height: null });
                }}
                keyboardType="number-pad"
                editable={!loading}
              />
              {errors.height && (
                <Text style={styles.errorText}>{errors.height}</Text>
              )}
            </View>

            {/* Real-time Calculated Targets Preview */}
            {calculatedTargets && (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Calculated Targets</Text>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Calories</Text>
                  <Text style={styles.targetValue}>
                    {calculatedTargets.calories} kcal
                  </Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Carbs / Protein / Fats</Text>
                  <Text style={styles.targetValue}>
                    {calculatedTargets.carbs}g / {calculatedTargets.protein}g /{" "}
                    {calculatedTargets.fats}g
                  </Text>
                </View>
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
              activeOpacity={0.8}
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 44 : 24,
    paddingBottom: 40,
  },
  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2D2621",
    letterSpacing: 1,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#F8F6F2",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  formCard: {
    backgroundColor: "rgba(252, 250, 247, 0.94)",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B5A4E",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  genderButtonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E0D8",
    backgroundColor: "#F7F5F2",
    justifyContent: "center",
    alignItems: "center",
  },
  genderButtonActive: {
    borderColor: "#963E00",
    backgroundColor: "#963E00",
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B5563",
  },
  genderButtonTextActive: {
    color: "#FFFFFF",
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E0D8",
    backgroundColor: "#F7F5F2",
    fontSize: 14,
    color: "#2D2621",
    fontWeight: "500",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    fontWeight: "500",
  },
  previewCard: {
    backgroundColor: "#EFECE6",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B5A4E",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 12,
    color: "#4B5563",
  },
  targetValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D2621",
  },
  completeButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#963E00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  completeButtonDisabled: {
    opacity: 0.65,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B5A4E",
  },
});

export default OnboardingScreen;
