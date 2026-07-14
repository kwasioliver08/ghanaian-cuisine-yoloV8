import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
// Ensuring FontAwesome is destructured safely here
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";

/**
 * HomeScreen Component
 * Displays a highly visual nutritional dashboard and historical dietary timeline log
 * Section 3.5 Functional Requirement: Nutritional Dashboard Visualization
 */
const HomeScreen = ({
  userProfile,
  dailyTargets,
  onLogout,
  onNavigateToScanner,
}) => {
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
      isAiDetected: true,
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
      isAiDetected: false,
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

  const getRemainingAllowance = (key) => {
    const target = dailyTargets ? dailyTargets[key] : 2000;
    const consumed = consumedNutrients[key] || 0;
    return Math.max(0, target - consumed);
  };

  const getProgressPercentage = (key) => {
    const target = dailyTargets && dailyTargets[key] ? dailyTargets[key] : 2000;
    const consumed = consumedNutrients[key] || 0;
    return Math.min(100, (consumed / target) * 100);
  };

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
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>TODAY</Text>
          </View>
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

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>{consumedNutrients.calories}</Text>
              <Text style={styles.heroStatLabel}>Consumed</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>
                {dailyTargets?.calories || 2000}
              </Text>
              <Text style={styles.heroStatLabel}>Goal</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>{loggedMeals.length}</Text>
              <Text style={styles.heroStatLabel}>Meals</Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <Text style={styles.dashboardSectionTitle}>Macro Allocations</Text>
          <View style={styles.macroListGrid}>
            {renderMacroRow("Carbohydrates (55%)", "carbs", "#DD6B20")}
            {renderMacroRow("Protein (20%)", "protein", "#3182CE")}
            {renderMacroRow("Fats (25%)", "fats", "#E53E3E")}
          </View>
        </View>

        {/* Historical Dietary Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Meal Timeline</Text>

          {loggedMeals.map((meal) => (
            <View key={meal.id} style={styles.mealLogCard}>
              <View style={styles.mealCardHeader}>
                <View>
                  <Text style={styles.mealCategoryTitle}>{meal.type}</Text>
                  <Text style={styles.mealTimeText}>{meal.time}</Text>
                </View>
                <Text style={styles.mealCalorieTag}>+{meal.calories} kcal</Text>
              </View>

              <Text style={styles.mealNameText}>{meal.name}</Text>

              <View style={styles.mealPillGroupRow}>
                <View
                    style={[styles.macroPill, { backgroundColor: "rgba(221, 107, 32, 0.10)" }]}
                >
                    <Text style={[styles.macroPillText, { color: "#C05621" }]}>
                    Carbs: {meal.carbs}g
                  </Text>
                </View>
                <View
                    style={[styles.macroPill, { backgroundColor: "rgba(49, 130, 206, 0.10)" }]}
                >
                    <Text style={[styles.macroPillText, { color: "#2B6CB0" }]}>
                    Protein: {meal.protein}g
                  </Text>
                </View>
                <View
                    style={[styles.macroPill, { backgroundColor: "rgba(229, 62, 62, 0.10)" }]}
                >
                    <Text style={[styles.macroPillText, { color: "#C53030" }]}>
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
          ))}
        </View>

        {/* Session Log Out Actions */}
        <View style={styles.logoutActionContainer}>
          <TouchableOpacity style={styles.signOutButton} onPress={onLogout}>
            <Text style={styles.signOutButtonText}>Sign Out Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Upgraded Floating Action Button (FAB) with Vector Icon */}
      {/* Upgraded Floating Action Button (FAB) with Custom Lens Vector */}
      <TouchableOpacity
        style={styles.floatingCameraButton}
        activeOpacity={0.85}
        onPress={onNavigateToScanner}
      >
        {/* Swapped to matching material iris lens icon */}
        <MaterialCommunityIcons name="camera" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#334155B",
  },
  welcomeText: {
    fontSize: 29,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -0.7,
  },
  dateText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    marginTop: 6,
  },
  dashboardCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.90)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 5,
  },
  caloriesDisplayGroup: {
    alignItems: "center",
    marginVertical: 12,
  },
  bigCalorieNumber: {
    fontSize: 58,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -1.2,
  },
  bigCalorieLabel: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#E7E0D8",
    width: "100%",
    marginVertical: 16,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dashboardSectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
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
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  macroRowValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
  },
  macroRemainingText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  mealLogCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.90)",
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  mealCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealCategoryTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mealTimeText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
    marginTop: 2,
  },
  mealCalorieTag: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  mealNameText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 12,
  },
  mealPillGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  macroPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  macroPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  aiDetectedBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.10)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.16)",
    marginLeft: "auto",
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
    letterSpacing: 0.5,
  },
  logoutActionContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
    alignItems: "center",
  },
  signOutButton: {
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.14)",
    width: "100%",
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  floatingCameraButton: {
    position: "absolute",
    bottom: 28,
    right: 24,
    backgroundColor: "#0F172A",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 7,
  },
});

export default HomeScreen;
