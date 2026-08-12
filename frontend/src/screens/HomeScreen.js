import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../utils/api";

const HomeScreen = ({
  userProfile,
  dailyTargets,
  onLogout,
  onNavigateToScanner,
  onNavigateToHistory,
}) => {
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDailyLogs = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const mealsData = await api.getDailyMeals(userProfile.id);
      setLoggedMeals(mealsData || []);
    } catch (error) {
      console.error("Failed to load daily logs:", error);
      Alert.alert(
        "Data Sync Error",
        "Could not load today's nutritional entries from the server.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchDailyLogs(true);
    }
  }, [userProfile?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDailyLogs(false);
  };

  // Dynamically aggregate metrics from all live database meals consumed today
  const consumedNutrients = useMemo(() => {
    return loggedMeals.reduce(
      (totals, meal) => {
        totals.calories += Math.round(meal.calories || 0);
        totals.carbs += Math.round(meal.carbs || 0);
        totals.protein += Math.round(meal.protein || 0);
        totals.fats += Math.round(meal.fats || 0);
        return totals;
      },
      { calories: 0, carbs: 0, protein: 0, fats: 0 },
    );
  }, [loggedMeals]);

  const getTarget = (key, fallback) =>
    dailyTargets && dailyTargets[key] ? dailyTargets[key] : fallback;

  const remainingCalories = Math.max(
    0,
    getTarget("calories", 2200) - consumedNutrients.calories,
  );

  const getProgressPercentage = (consumed, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(100, (consumed / target) * 100);
  };

  // Most recent logged meal for the "Last Scanned" card
  const lastScannedMeal = loggedMeals.length > 0 ? loggedMeals[0] : null;

  return (
    <View style={styles.rootContainer}>
      {loading ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color="#963E00" />
          <Text style={styles.loaderText}>Syncing metrics dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#963E00"
              colors={["#963E00"]}
            />
          }
        >
          {/* Top Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {userProfile?.fullName
                    ? userProfile.fullName.charAt(0).toUpperCase()
                    : "K"}
                </Text>
              </View>
              <Text style={styles.headerTitle}>
                Akwaaba, {userProfile?.fullName?.split(" ")[0] || "Kofi"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color="#963E00" />
            </TouchableOpacity>
          </View>

          {/* Daily Summary Card */}
          <View style={styles.card}>
            {/* Circular Calorie Gauge */}
            <View style={styles.calorieRingContainer}>
              <View style={styles.calorieRingOuter}>
                <View style={styles.calorieRingInner}>
                  <Text style={styles.calorieValueText}>
                    {remainingCalories.toLocaleString()}
                  </Text>
                  <Text style={styles.calorieSubText}>KCAL LEFT</Text>
                </View>
              </View>
            </View>

            <Text style={styles.summaryTitle}>Daily Summary</Text>
            <Text style={styles.summarySubtext}>
              You've consumed {consumedNutrients.calories.toLocaleString()} of
              your {getTarget("calories", 2200).toLocaleString()} kcal daily
              goal.
            </Text>

            {/* Macro Summary Chips */}
            <View style={styles.macroPillRow}>
              <View style={styles.macroPillBox}>
                <Text style={styles.macroPillLabel}>Carbs</Text>
                <Text style={styles.macroPillValue}>
                  {consumedNutrients.carbs}g
                </Text>
              </View>
              <View style={styles.macroPillBox}>
                <Text style={styles.macroPillLabel}>Protein</Text>
                <Text style={[styles.macroPillValue, { color: "#1B5E20" }]}>
                  {consumedNutrients.protein}g
                </Text>
              </View>
              <View style={styles.macroPillBox}>
                <Text style={styles.macroPillLabel}>Fats</Text>
                <Text style={[styles.macroPillValue, { color: "#963E00" }]}>
                  {consumedNutrients.fats}g
                </Text>
              </View>
            </View>
          </View>

          {/* Nutrient Goals Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeaderTitle}>Nutrient Goals</Text>

            {/* Protein Goal Bar */}
            <View style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <View style={styles.goalLabelGroup}>
                  <View
                    style={[styles.colorDot, { backgroundColor: "#1B5E20" }]}
                  />
                  <Text style={styles.goalLabel}>Protein</Text>
                </View>
                <Text style={styles.goalValue}>
                  {consumedNutrients.protein} / {getTarget("protein", 108)}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${getProgressPercentage(
                        consumedNutrients.protein,
                        getTarget("protein", 108),
                      )}%`,
                      backgroundColor: "#1B5E20",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Carbs Goal Bar */}
            <View style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <View style={styles.goalLabelGroup}>
                  <View
                    style={[styles.colorDot, { backgroundColor: "#4A2810" }]}
                  />
                  <Text style={styles.goalLabel}>Carbs</Text>
                </View>
                <Text style={styles.goalValue}>
                  {consumedNutrients.carbs} / {getTarget("carbs", 295)}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${getProgressPercentage(
                        consumedNutrients.carbs,
                        getTarget("carbs", 295),
                      )}%`,
                      backgroundColor: "#4A2810",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Fats Goal Bar */}
            <View style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <View style={styles.goalLabelGroup}>
                  <View
                    style={[styles.colorDot, { backgroundColor: "#963E00" }]}
                  />
                  <Text style={styles.goalLabel}>Fats</Text>
                </View>
                <Text style={styles.goalValue}>
                  {consumedNutrients.fats} / {getTarget("fats", 60)}g
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${getProgressPercentage(
                        consumedNutrients.fats,
                        getTarget("fats", 60),
                      )}%`,
                      backgroundColor: "#963E00",
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Last Scanned Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Last Scanned</Text>
            <TouchableOpacity onPress={onNavigateToHistory} activeOpacity={0.7}>
              <Text style={styles.viewHistoryText}>View History</Text>
            </TouchableOpacity>
          </View>

          {lastScannedMeal ? (
            <View style={styles.lastScannedCard}>
              {/* Scanned Image or Fallback */}
              <View style={styles.lastScannedImageContainer}>
                <Image
                  source={
                    lastScannedMeal.image_url
                      ? { uri: lastScannedMeal.image_url }
                      : require("../../assets/sign_in_banner.jpg")
                  }
                  style={styles.lastScannedImage}
                  resizeMode="cover"
                />
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                </View>
              </View>

              {/* Meal Details */}
              <View style={styles.lastScannedDetails}>
                <View style={styles.lastScannedTitleRow}>
                  <Text style={styles.lastScannedName}>
                    {lastScannedMeal.name}
                  </Text>
                  <View style={styles.calorieBadge}>
                    <Text style={styles.calorieBadgeNumber}>
                      {Math.round(lastScannedMeal.calories)}
                    </Text>
                    <Text style={styles.calorieBadgeLabel}>KCAL</Text>
                  </View>
                </View>

                <Text style={styles.lastScannedSubtext}>
                  {lastScannedMeal.type || "Daily Meal Entry"}
                </Text>

                {/* Macro Tags */}
                <View style={styles.tagRow}>
                  <View
                    style={[styles.tagPill, { backgroundColor: "#E8F5E9" }]}
                  >
                    <Text style={[styles.tagText, { color: "#1B5E20" }]}>
                      Carbs: {Math.round(lastScannedMeal.carbs)}g
                    </Text>
                  </View>
                  <View
                    style={[styles.tagPill, { backgroundColor: "#E3F2FD" }]}
                  >
                    <Text style={[styles.tagText, { color: "#1565C0" }]}>
                      Protein: {Math.round(lastScannedMeal.protein)}g
                    </Text>
                  </View>
                  <View
                    style={[styles.tagPill, { backgroundColor: "#FFF3E0" }]}
                  >
                    <Text style={[styles.tagText, { color: "#E65100" }]}>
                      Fats: {Math.round(lastScannedMeal.fats)}g
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyScannedCard}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={36}
                color="#8C857B"
              />
              <Text style={styles.emptyScannedText}>No meals logged today</Text>
              <Text style={styles.emptyScannedSubtext}>
                Tap the camera button to scan and log your first Ghanaian meal!
              </Text>
            </View>
          )}

          {/* Sign Out Link */}
          <TouchableOpacity style={styles.signOutButton} onPress={onLogout}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Floating Scan Camera FAB */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={onNavigateToScanner}
      >
        <MaterialCommunityIcons name="camera" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 44 : 20,
    paddingBottom: 100,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B5A4E",
    fontWeight: "600",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4A2810",
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  calorieRingContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  calorieRingOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 12,
    borderColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
  },
  calorieRingInner: {
    alignItems: "center",
  },
  calorieValueText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1F2937",
  },
  calorieSubText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B5A4E",
    marginTop: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 13,
    color: "#6B5A4E",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 16,
  },
  macroPillRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroPillBox: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  macroPillLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  macroPillValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },
  goalRow: {
    marginBottom: 14,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  goalLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  goalValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#EEF2F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  viewHistoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#963E00",
  },
  lastScannedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  lastScannedImageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  lastScannedImage: {
    width: "100%",
    height: "100%",
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#1B5E20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lastScannedDetails: {
    padding: 16,
  },
  lastScannedTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  lastScannedName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    flex: 1,
  },
  calorieBadge: {
    alignItems: "flex-end",
  },
  calorieBadgeNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#963E00",
  },
  calorieBadgeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6B5A4E",
  },
  lastScannedSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyScannedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyScannedText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginTop: 8,
  },
  emptyScannedSubtext: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  signOutButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#963E00",
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#963E00",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#963E00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default HomeScreen;
