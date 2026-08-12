import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// --- IMPORT LIVE API AND TOAST HELPERS ---
import { api } from "../utils/api";
import NotificationToast from "../components/NotificationToast";
import { useNotification } from "../hooks/useNotification";

const { width } = Dimensions.get("window");

const ProfileScreen = ({
  userProfile,
  dailyTargets,
  onboardingDetails,
  onLogout,
  onEditMacroAllocation,
  onClearScanIndexes,
}) => {
  const [viewMode, setViewMode] = useState("SETTINGS");

  // Historical database ledger states
  const [lifetimeMeals, setLifetimeMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Selector states for dynamic filtering spans
  const [startYear, setStartYear] = useState(2026);
  const [startMonth, setStartMonth] = useState(8);
  const [startDay, setStartDay] = useState(1);

  const [endYear, setEndYear] = useState(2026);
  const [endMonth, setEndMonth] = useState(8);
  const [endDay, setEndDay] = useState(31);

  const [activePicker, setActivePicker] = useState(null);

  // Initialize Toast Manager
  const { notification, showNotification, hideNotification } =
    useNotification();

  const YEARS_ARRAY = [2025, 2026, 2027];

  const MONTHS_MAP = [
    { label: "Jan", value: 1 },
    { label: "Feb", value: 2 },
    { label: "Mar", value: 3 },
    { label: "Apr", value: 4 },
    { label: "May", value: 5 },
    { label: "Jun", value: 6 },
    { label: "Jul", value: 7 },
    { label: "Aug", value: 8 },
    { label: "Sep", value: 9 },
    { label: "Oct", value: 10 },
    { label: "Nov", value: 11 },
    { label: "Dec", value: 12 },
  ];

  const DAYS_ARRAY = Array.from({ length: 31 }, (_, i) => i + 1);

  const profile = userProfile || {
    fullName: "Kwakye Oliver Andoh",
    email: "kwasioliver08@gmail.com",
    joinedDate: "July 2026",
  };

  const targets = dailyTargets || {
    calories: 2150,
    carbs: 295,
    protein: 108,
    fats: 60,
  };

  useEffect(() => {
    if (viewMode === "HISTORY") {
      fetchUserLifetimeLedger();
    }
  }, [viewMode, startYear, startMonth, startDay, endYear, endMonth, endDay]);

  const fetchUserLifetimeLedger = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await api.fetchMealsHistory(
        profile.id || profile._id || "anonymous_user",
      );
      if (data) {
        setLifetimeMeals(data);
        applyDateFilteringRange(data);
      }
    } catch (error) {
      console.error("Historical Ledger Parsing Error:", error);
      showNotification("Could not load historical data rows.", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const applyDateFilteringRange = (allMeals) => {
    try {
      const startBound = new Date(
        startYear,
        startMonth - 1,
        startDay,
        0,
        0,
        0,
        0,
      );
      const endBound = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

      const filtered = allMeals.filter((meal) => {
        if (!meal.logged_at) return false;
        const mealDate = new Date(meal.logged_at);
        return mealDate >= startBound && mealDate <= endBound;
      });

      setFilteredMeals(filtered);
    } catch (e) {
      setFilteredMeals(allMeals);
    }
  };

  const toggleDropdownPicker = (pickerId) => {
    setActivePicker(activePicker === pickerId ? null : pickerId);
  };

  const formatMonthLabel = (monthValue) => {
    return MONTHS_MAP.find((m) => m.value === monthValue)?.label || monthValue;
  };

  // --- SUB-SCREEN LAYER RENDER ROUTE: LIFETIME SCANNING HISTORY ---
  if (viewMode === "HISTORY") {
    return (
      <View style={styles.historyContainer}>
        <NotificationToast {...notification} onClose={hideNotification} />

        {/* Top Header */}
        <View style={styles.historyHeaderBar}>
          <TouchableOpacity
            style={styles.backButtonInline}
            onPress={() => {
              setViewMode("SETTINGS");
              setActivePicker(null);
            }}
          >
            <Feather name="arrow-left" size={20} color="#4A2810" />
            <Text style={styles.backButtonText}>Profile</Text>
          </TouchableOpacity>
          <Text style={styles.historyBarTitle}>Scanning History</Text>
          <TouchableOpacity
            onPress={fetchUserLifetimeLedger}
            style={styles.refreshButtonIcon}
          >
            <Feather name="refresh-cw" size={16} color="#963E00" />
          </TouchableOpacity>
        </View>

        {/* Date Filter Panel */}
        <View style={styles.dateSelectorPanel}>
          <Text style={styles.panelTitleText}>Auditing Range Filter</Text>

          <View style={styles.dateSelectorGridRow}>
            <View style={styles.pickerBlock}>
              <Text style={styles.inputLabelMicro}>From Date</Text>
              <View style={styles.selectorButtonsContainer}>
                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("START_YEAR")}
                >
                  <Text style={styles.triggerButtonText}>{startYear}</Text>
                  <Feather name="chevron-down" size={10} color="#963E00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("START_MONTH")}
                >
                  <Text style={styles.triggerButtonText}>
                    {formatMonthLabel(startMonth)}
                  </Text>
                  <Feather name="chevron-down" size={10} color="#963E00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("START_DAY")}
                >
                  <Text style={styles.triggerButtonText}>{startDay}</Text>
                  <Feather name="chevron-down" size={10} color="#963E00" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.pickerBlock}>
              <Text style={styles.inputLabelMicro}>To Date</Text>
              <View style={styles.selectorButtonsContainer}>
                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("END_YEAR")}
                >
                  <Text style={styles.triggerButtonText}>{endYear}</Text>
                  <Feather name="chevron-down" size={10} color="#963E00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("END_MONTH")}
                >
                  <Text style={styles.triggerButtonText}>
                    {formatMonthLabel(endMonth)}
                  </Text>
                  <Feather name="chevron-down" size={10} color="#963E00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("END_DAY")}
                >
                  <Text style={styles.triggerButtonText}>{endDay}</Text>
                  <Feather name="chevron-down" size={10} color="#963E00" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {activePicker && (
            <View style={styles.expandedTrayWrapper}>
              <View style={styles.trayHeaderRow}>
                <Text style={styles.trayTitleText}>
                  Select{" "}
                  {activePicker.includes("YEAR")
                    ? "Year"
                    : activePicker.includes("MONTH")
                      ? "Month"
                      : "Day"}
                </Text>
                <TouchableOpacity onPress={() => setActivePicker(null)}>
                  <Feather name="x" size={14} color="#6B5A4E" />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trayScrollContent}
              >
                {activePicker.includes("YEAR")
                  ? YEARS_ARRAY.map((y) => (
                      <TouchableOpacity
                        key={y}
                        style={[
                          styles.trayItemChip,
                          ((activePicker === "START_YEAR" && startYear === y) ||
                            (activePicker === "END_YEAR" && endYear === y)) &&
                            styles.trayItemChipActive,
                        ]}
                        onPress={() => {
                          if (activePicker === "START_YEAR") setStartYear(y);
                          else setEndYear(y);
                          setActivePicker(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.trayChipLabel,
                            ((activePicker === "START_YEAR" &&
                              startYear === y) ||
                              (activePicker === "END_YEAR" && endYear === y)) &&
                              styles.trayChipLabelActive,
                          ]}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))
                  : activePicker.includes("MONTH")
                    ? MONTHS_MAP.map((m) => (
                        <TouchableOpacity
                          key={m.value}
                          style={[
                            styles.trayItemChip,
                            ((activePicker === "START_MONTH" &&
                              startMonth === m.value) ||
                              (activePicker === "END_MONTH" &&
                                endMonth === m.value)) &&
                              styles.trayItemChipActive,
                          ]}
                          onPress={() => {
                            if (activePicker === "START_MONTH")
                              setStartMonth(m.value);
                            else setEndMonth(m.value);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.trayChipLabel,
                              ((activePicker === "START_MONTH" &&
                                startMonth === m.value) ||
                                (activePicker === "END_MONTH" &&
                                  endMonth === m.value)) &&
                                styles.trayChipLabelActive,
                            ]}
                          >
                            {m.label}
                          </Text>
                        </TouchableOpacity>
                      ))
                    : DAYS_ARRAY.map((d) => (
                        <TouchableOpacity
                          key={d}
                          style={[
                            styles.trayItemChip,
                            ((activePicker === "START_DAY" && startDay === d) ||
                              (activePicker === "END_DAY" && endDay === d)) &&
                              styles.trayItemChipActive,
                          ]}
                          onPress={() => {
                            if (activePicker === "START_DAY") setStartDay(d);
                            else setEndDay(d);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.trayChipLabel,
                              ((activePicker === "START_DAY" &&
                                startDay === d) ||
                                (activePicker === "END_DAY" && endDay === d)) &&
                                styles.trayChipLabelActive,
                            ]}
                          >
                            {d}
                          </Text>
                        </TouchableOpacity>
                      ))}
              </ScrollView>
            </View>
          )}
        </View>

        {isLoadingHistory ? (
          <View style={styles.historyLoaderContainer}>
            <ActivityIndicator size="large" color="#963E00" />
            <Text style={styles.historyLoaderText}>
              Loading history entries...
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.historyScrollWindow}
            showsVerticalScrollIndicator={false}
          >
            {filteredMeals.length === 0 ? (
              <View style={styles.historyEmptyCardState}>
                <Feather name="calendar" size={34} color="#8C857B" />
                <Text style={styles.historyEmptyStateTitle}>
                  No Logs Within Range
                </Text>
                <Text style={styles.historyEmptyStateSub}>
                  No plate scans found between {formatMonthLabel(startMonth)}{" "}
                  {startDay}, {startYear} and {formatMonthLabel(endMonth)}{" "}
                  {endDay}, {endYear}.
                </Text>
              </View>
            ) : (
              filteredMeals.map((meal, index) => {
                const clockTime = meal.logged_at
                  ? new Date(meal.logged_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Logged";

                return (
                  <View
                    key={meal.id || `hist_${index}`}
                    style={styles.historyRowCard}
                  >
                    <View style={styles.historyCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyMealName}>{meal.name}</Text>
                        <Text style={styles.historyMealTimestamp}>
                          {clockTime} • {meal.type || "Meal Entry"}
                        </Text>
                      </View>
                      <Text style={styles.historyCalorieCount}>
                        +{Math.round(meal.calories)} kcal
                      </Text>
                    </View>

                    <View style={styles.historyMacroPillsRow}>
                      <Text style={styles.inlineMacroPillText}>
                        Carbs: {Math.round(meal.carbs)}g
                      </Text>
                      <Text style={styles.inlineMacroPillText}>
                        Protein: {Math.round(meal.protein)}g
                      </Text>
                      <Text style={styles.inlineMacroPillText}>
                        Fats: {Math.round(meal.fats)}g
                      </Text>

                      {meal.is_ai_detected && (
                        <View style={styles.yoloMicroBadge}>
                          <Text style={styles.yoloMicroText}>VERIFIED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  // --- MAIN RENDER ROUTE: PROFILE VIEW ---
  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <NotificationToast {...notification} onClose={hideNotification} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile.fullName
                  ? profile.fullName.charAt(0).toUpperCase()
                  : "K"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBadge}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profile.fullName}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Current Details */}
        <Text style={styles.sectionTitle}>Current Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>GENDER</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.gender || "Male"}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>AGE</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.age ? onboardingDetails.age : "28"}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>WEIGHT</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.weight
                ? `${onboardingDetails.weight}kg`
                : "75kg"}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>HEIGHT</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.height
                ? `${onboardingDetails.height}cm`
                : "180cm"}
            </Text>
          </View>
        </View>

        {/* Daily Metabolic Targets */}
        <Text style={styles.sectionTitle}>Daily Metabolic Targets</Text>
        <View style={styles.macroGrid}>
          <View style={[styles.macroCard, { borderLeftColor: "#2563EB" }]}>
            <Text style={styles.macroLabel}>Energy Target</Text>
            <Text style={styles.macroValue}>
              {targets.calories} <Text style={styles.macroUnit}>kcal</Text>
            </Text>
          </View>

          <View style={[styles.macroCard, { borderLeftColor: "#16A34A" }]}>
            <Text style={styles.macroLabel}>Protein Target</Text>
            <Text style={styles.macroValue}>
              {targets.protein} <Text style={styles.macroUnit}>g</Text>
            </Text>
          </View>

          <View style={[styles.macroCard, { borderLeftColor: "#EA580C" }]}>
            <Text style={styles.macroLabel}>Carbohydrates</Text>
            <Text style={styles.macroValue}>
              {targets.carbs} <Text style={styles.macroUnit}>g</Text>
            </Text>
          </View>

          <View style={[styles.macroCard, { borderLeftColor: "#DC2626" }]}>
            <Text style={styles.macroLabel}>Lipids / Fats</Text>
            <Text style={styles.macroValue}>
              {targets.fats} <Text style={styles.macroUnit}>g</Text>
            </Text>
          </View>
        </View>

        {/* Workspace Settings */}
        <Text style={styles.sectionTitle}>Workspace Settings</Text>
        <View style={styles.settingsMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setViewMode("HISTORY")}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>Itemized Scanning History</Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (onEditMacroAllocation) {
                onEditMacroAllocation();
                return;
              }
              showNotification(
                "Macro allocation module is unreachable.",
                "error",
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>
              Edit Macro Allocation Profile
            </Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (onClearScanIndexes) {
                onClearScanIndexes();
                showNotification(
                  "Scanner indexing engines flushed completely!",
                  "success",
                );
                return;
              }
              showNotification(
                "Clear actions are locked at this time.",
                "info",
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuItemText}>Clear Local Scan Indexes</Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutCardButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={16} color="#DC2626" />
          <Text style={styles.signOutCardText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 44 : 20,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2B1A0F",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#963E00",
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  detailCard: {
    width: (width - 52) / 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  settingsMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  signOutCardButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  signOutCardText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },

  /* ---------------- Sub-Screen History Styles ---------------- */
  historyContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  historyHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 44 : 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButtonInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4A2810",
  },
  historyBarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  refreshButtonIcon: {
    padding: 4,
  },
  dateSelectorPanel: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  panelTitleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#963E00",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  dateSelectorGridRow: {
    flexDirection: "row",
    gap: 12,
  },
  pickerBlock: {
    flex: 1,
  },
  inputLabelMicro: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  selectorButtonsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  dropdownTriggerButton: {
    flex: 1,
    height: 36,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  triggerButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  expandedTrayWrapper: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  trayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trayTitleText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },
  trayScrollContent: {
    paddingVertical: 4,
    gap: 6,
  },
  trayItemChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginRight: 6,
  },
  trayItemChipActive: {
    backgroundColor: "#963E00",
  },
  trayChipLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  trayChipLabelActive: {
    color: "#FFFFFF",
  },
  historyLoaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  historyLoaderText: {
    fontSize: 13,
    color: "#6B5A4E",
    fontWeight: "600",
    marginTop: 12,
  },
  historyScrollWindow: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  historyEmptyCardState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 12,
  },
  historyEmptyStateTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
    marginTop: 12,
    marginBottom: 4,
  },
  historyEmptyStateSub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  historyRowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyMealName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },
  historyMealTimestamp: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  historyCalorieCount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#963E00",
  },
  historyMacroPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  inlineMacroPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  yoloMicroBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: "auto",
  },
  yoloMicroText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1B5E20",
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
