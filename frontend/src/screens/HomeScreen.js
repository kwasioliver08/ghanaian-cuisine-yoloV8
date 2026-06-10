import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

/**
 * HomeScreen Component
 * Displays a highly visual nutritional dashboard and historical dietary timeline log
 * Section 3.5 Functional Requirement: Nutritional Dashboard Visualization
 */
const HomeScreen = ({ userProfile, dailyTargets, onLogout }) => {
  // Pre-populating with mock data matching our exact 12 YOLOv8 classification targets
  const [loggedMeals, setLoggedMeals] = useState([
    {
      id: "meal_1",
      type: "Breakfast",
      time: "07:30 AM",
      name: "Hausa Koko & Bread",
      calories: 420,
      carbs: 86,
      protein: 11,
      fats: 3,
      isAiDetected: true,
    },
    {
      id: "meal_2",
      type: "Lunch",
      time: "01:15 PM",
      name: "Waakye with Fried Plantain & Beans",
      calories: 890,
      carbs: 133,
      protein: 30,
      fats: 23,
      isAiDetected: true, // Highlights real-time YOLOv8 classification source
    },
    {
      id: "meal_3",
      type: "Dinner",
      time: "06:45 PM",
      name: "Banku with Grilled Fish",
      calories: 540,
      carbs: 74,
      protein: 44,
      fats: 7,
      isAiDetected: false, // Simulated manual logging alternative
    },
  ]);

  // Dynamically aggregate metrics from all meals consumed today
  const consumedNutrients = useMemo(() => {
    return loggedMeals.reduce(
      (totals, meal) => {
        totals.calories += meal.calories;
        totals.carbs += meal.carbs;
        totals.protein += meal.protein;
        totals.fats += meal.fats;
        return totals;
      },
      { calories: 0, carbs: 0, protein: 0, fats: 0 },
    );
  }, [loggedMeals]);

  /**
   * Calculate remaining allowance for each macro metric
   */
  const getRemainingAllowance = (key) => {
    const target = dailyTargets ? dailyTargets[key] : 2000; // Safe runtime fallback thresholds
    const consumed = consumedNutrients[key] || 0;
    return Math.max(0, target - consumed);
  };

  /**
   * Calculate progress percentage for progress bar fills
   */
  const getProgressPercentage = (key) => {
    const target = dailyTargets && dailyTargets[key] ? dailyTargets[key] : 2000;
    const consumed = consumedNutrients[key] || 0;
    return Math.min(100, (consumed / target) * 100);
  };

  /**
   * Render macro progress row item inside a clean dashboard grid layout
   */
  const renderMacroRow = (label, key, color) => {
    const target = dailyTargets ? dailyTargets[key] : 0;
    const consumed = consumedNutrients[key];
    const remaining = getRemainingAllowance(key);
    const progress = getProgressPercentage(key);
    const unit = key === "calories" ? " kcal" : "g";

    return (
      <View key={key} style={styles.macroRowItem}>
        <View style={styles.macroRowHeader}>
          <Text style={styles.macroRowLabel}>{label}</Text>
          <Text style={styles.macroRowValue}>
            {consumed} / {target}
            {unit}
            <Text style={styles.macroRemainingText}> ({remaining} left)</Text>
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Welcome Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {userProfile?.fullName?.split(" ")[0] || "User"}
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Nutritional Dashboard Summary Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.caloriesDisplayGroup}>
            <Text style={styles.bigCalorieNumber}>
              {getRemainingAllowance("calories")}
            </Text>
            <Text style={styles.bigCalorieLabel}>Calories Remaining</Text>
          </View>

          <View style={styles.dividerLine} />

          <Text style={styles.dashboardSectionTitle}>Macro Allocations</Text>
          <View style={styles.macroListGrid}>
            {renderMacroRow("Carbohydrates (55%)", "carbs", "#3182CE")}
            {renderMacroRow("Protein (20%)", "protein", "#38A169")}
            {renderMacroRow("Fats (25%)", "fats", "#DD6B20")}
          </View>
        </View>

        {/* Historical Dietary Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Dietary Timeline Log</Text>

          {loggedMeals.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>No meals logged yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the camera icon below to snap and scan your food plate using
                computer vision.
              </Text>
            </View>
          ) : (
            loggedMeals.map((meal) => (
              <View key={meal.id} style={styles.mealLogCard}>
                <View style={styles.mealCardHeader}>
                  <View>
                    <Text style={styles.mealCategoryTitle}>{meal.type}</Text>
                    <Text style={styles.mealTimeText}>{meal.time}</Text>
                  </View>
                  <Text style={styles.mealCalorieTag}>
                    +{meal.calories} kcal
                  </Text>
                </View>

                <Text style={styles.mealNameText}>{meal.name}</Text>

                <View style={styles.mealPillGroupRow}>
                  <View
                    style={[styles.macroPill, { backgroundColor: "#EBF8FF" }]}
                  >
                    <Text style={[styles.macroPillText, { color: "#2B6CB0" }]}>
                      Carbs: {meal.carbs}g
                    </Text>
                  </View>
                  <View
                    style={[styles.macroPill, { backgroundColor: "#E6FFFA" }]}
                  >
                    <Text style={[styles.macroPillText, { color: "#234E52" }]}>
                      Protein: {meal.protein}g
                    </Text>
                  </View>
                  <View
                    style={[styles.macroPill, { backgroundColor: "#FFFAF0" }]}
                  >
                    <Text style={[styles.macroPillText, { color: "#7B341E" }]}>
                      Fats: {meal.fats}g
                    </Text>
                  </View>

                  {meal.isAiDetected && (
                    <View style={styles.aiDetectedBadge}>
                      <Text style={styles.aiBadgeText}>YOLOv8 AI</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Session Log Out Actions */}
        <View style={styles.logoutActionContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => {
              Alert.alert(
                "Sign Out",
                "Are you sure you want to end your active session?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", onPress: onLogout, style: "destructive" },
                ],
              );
            }}
          >
            <Text style={styles.signOutButtonText}>Sign Out Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) for AI Vision Viewfinder */}
      <TouchableOpacity
        style={styles.floatingCameraButton}
        activeOpacity={0.85}
        onPress={() =>
          Alert.alert(
            "AI Vision Scanner",
            "Initializing local camera permissions...",
          )
        }
      >
        <Text style={styles.cameraIconText}>📷</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Clear floating bounds so contents are fully accessible
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1A202C",
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "600",
    marginTop: 4,
  },
  dashboardCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  caloriesDisplayGroup: {
    alignItems: "center",
    marginVertical: 12,
  },
  bigCalorieNumber: {
    fontSize: 54,
    fontWeight: "900",
    color: "#1A202C",
    letterSpacing: -1,
  },
  bigCalorieLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#E2E8F0",
    width: "100%",
    marginVertical: 18,
  },
  dashboardSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A5568",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  macroListGrid: {
    width: "100%",
  },
  macroRowItem: {
    marginBottom: 16,
  },
  macroRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  macroRowLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A5568",
  },
  macroRowValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A202C",
  },
  macroRemainingText: {
    color: "#A0AEC0",
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#EDF2F7",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A202C",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  mealLogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  mealCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealCategoryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A0AEC0",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mealTimeText: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
    marginTop: 2,
  },
  mealCalorieTag: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A202C",
  },
  mealNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginTop: 8,
    marginBottom: 14,
  },
  mealPillGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  macroPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  macroPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  aiDetectedBadge: {
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    marginLeft: "auto",
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4A5568",
    letterSpacing: 0.5,
  },
  emptyStateCard: {
    backgroundColor: "#EDF2F7",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
  },
  logoutActionContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
    alignItems: "center",
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
    width: "100%",
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C53030",
  },
  floatingCameraButton: {
    position: "absolute",
    bottom: 28,
    right: 24,
    backgroundColor: "#1A202C",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraIconText: {
    fontSize: 26,
  },
});

export default HomeScreen;
