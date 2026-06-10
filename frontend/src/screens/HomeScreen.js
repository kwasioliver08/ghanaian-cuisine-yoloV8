import React, { useState } from "react";
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
 * Displays nutritional dashboard and historical dietary timeline
 * Section 3.5 Functional Requirement: Nutritional Dashboard Visualization
 */
const HomeScreen = ({ userProfile, dailyTargets, onLogout }) => {
  const [consumedNutrients, setConsumedNutrients] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fats: 0,
  });

  /**
   * Calculate remaining allowance for each macro
   */
  const getRemainingAllowance = (targetKey) => {
    const target = dailyTargets ? dailyTargets[targetKey] : 0;
    const consumed = consumedNutrients[targetKey] || 0;
    return Math.max(0, target - consumed);
  };

  /**
   * Calculate progress percentage for progress bar
   */
  const getProgressPercentage = (targetKey) => {
    const target =
      dailyTargets && dailyTargets[targetKey] ? dailyTargets[targetKey] : 1;
    const consumed = consumedNutrients[targetKey] || 0;
    return Math.min(100, (consumed / target) * 100);
  };

  /**
   * Render macro progress card
   */
  const renderMacroCard = (label, key, color) => {
    const target = dailyTargets ? dailyTargets[key] : 0;
    const consumed = consumedNutrients[key] || 0;
    const remaining = getRemainingAllowance(key);
    const progress = getProgressPercentage(key);

    return (
      <View key={key} style={styles.macroCard}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>
            {remaining} / {target}
            <Text style={styles.macroUnit}>
              {key === "calories" ? " kcal" : "g"}
            </Text>
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
        <Text style={styles.progressText}>
          {consumed} / {target} {key === "calories" ? "kcal" : "g"} consumed
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with User Name */}
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>
          Welcome, {userProfile?.fullName || "User"}
        </Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      </View>

      {/* Nutritional Dashboard Section */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionTitle}>Today's Nutritional Dashboard</Text>

        {/* Macro Progress Cards */}
        <View style={styles.macroGrid}>
          {renderMacroCard("Calories", "calories", "#2D3748")}
          {renderMacroCard("Carbs (55%)", "carbs", "#667EEA")}
          {renderMacroCard("Protein (20%)", "protein", "#F6AD55")}
          {renderMacroCard("Fats (25%)", "fats", "#48BB78")}
        </View>

        {/* Target Summary */}
        <View style={styles.targetSummaryCard}>
          <Text style={styles.summaryTitle}>Daily Target Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Calories:</Text>
            <Text style={styles.summaryValue}>
              {dailyTargets?.calories} kcal
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Carbohydrates:</Text>
            <Text style={styles.summaryValue}>{dailyTargets?.carbs} g</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Protein:</Text>
            <Text style={styles.summaryValue}>{dailyTargets?.protein} g</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fats:</Text>
            <Text style={styles.summaryValue}>{dailyTargets?.fats} g</Text>
          </View>
        </View>
      </View>

      {/* Historical Dietary Timeline Section */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Dietary Timeline</Text>

        {/* Empty State */}
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateText}>No meals logged yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start tracking your daily meals using the camera feature
          </Text>
        </View>

        {/* Sample meal log entries (for demonstration) */}
        <View style={styles.mealEntry}>
          <View style={styles.mealTimeContainer}>
            <Text style={styles.mealTime}>Breakfast</Text>
            <Text style={styles.mealTimeDetail}>7:30 AM</Text>
          </View>
          <View style={styles.mealDetails}>
            <Text style={styles.mealItemPlaceholder}>No items logged</Text>
          </View>
        </View>

        <View style={styles.mealEntry}>
          <View style={styles.mealTimeContainer}>
            <Text style={styles.mealTime}>Lunch</Text>
            <Text style={styles.mealTimeDetail}>12:30 PM</Text>
          </View>
          <View style={styles.mealDetails}>
            <Text style={styles.mealItemPlaceholder}>No items logged</Text>
          </View>
        </View>

        <View style={styles.mealEntry}>
          <View style={styles.mealTimeContainer}>
            <Text style={styles.mealTime}>Dinner</Text>
            <Text style={styles.mealTimeDetail}>6:30 PM</Text>
          </View>
          <View style={styles.mealDetails}>
            <Text style={styles.mealItemPlaceholder}>No items logged</Text>
          </View>
        </View>
      </View>

      {/* Footer Info and Logout */}
      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", onPress: onLogout, style: "destructive" },
            ]);
          }}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
  dashboardSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  macroGrid: {
    gap: 12,
    marginBottom: 16,
  },
  macroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A5568",
  },
  macroValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D3748",
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: "#718096",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "400",
  },
  targetSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#4A5568",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D3748",
  },
  timelineSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  mealEntry: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    gap: 12,
  },
  mealTimeContainer: {
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    paddingRight: 12,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2D3748",
  },
  mealTimeDetail: {
    fontSize: 11,
    color: "#718096",
    marginTop: 4,
  },
  mealDetails: {
    flex: 1,
    justifyContent: "center",
  },
  mealItemPlaceholder: {
    fontSize: 12,
    color: "#A0AEC0",
    fontStyle: "italic",
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: "#FED7D7",
    borderWidth: 1,
    borderColor: "#FC8181",
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C53030",
  },
});

export default HomeScreen;
