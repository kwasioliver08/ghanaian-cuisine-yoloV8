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
import { Feather } from "@expo/vector-icons";
// --- IMPORT THE NATIVE ENDPOINTS API WORKSPACE HANDSHAKE ---
import { api } from "../utils/api";
// --- 🔑 IMPORT REUSABLE TOAST ELEMENT INFRASTRUCTURE ---
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
  const [startMonth, setStartMonth] = useState(7);
  const [startDay, setStartDay] = useState(17);

  const [endYear, setEndYear] = useState(2026);
  const [endMonth, setEndMonth] = useState(7);
  const [endDay, setEndDay] = useState(18);

  const [activePicker, setActivePicker] = useState(null);

  // 🔑 INITIALIZE TOAST MANAGER
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

  const joinedDate = profile.joinedDate || "July 2026";

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
      console.error("Historical Ledger Parsing Mismatch:", error);
      showNotification("Could not synchronize lifetime data rows.", "error");
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

  // --- SUB-SCREEN LAYER RENDER ROUTE: LIFETIME ENTRY HISTORY LEDGER ---
  if (viewMode === "HISTORY") {
    return (
      <View style={styles.historyContainer}>
        {/* Render notification on history stack layer window if needed */}
        <NotificationToast {...notification} onClose={hideNotification} />

        <View style={styles.historyHeaderBar}>
          <TouchableOpacity
            style={styles.backButtonInline}
            onPress={() => {
              setViewMode("SETTINGS");
              setActivePicker(null);
            }}
          >
            <Feather name="arrow-left" size={20} color="#1F2937" />
            <Text style={styles.backButtonText}>Profile</Text>
          </TouchableOpacity>
          <Text style={styles.historyBarTitle}>Lifetime Entry History</Text>
          <TouchableOpacity
            onPress={fetchUserLifetimeLedger}
            style={styles.refreshButtonIcon}
          >
            <Feather name="refresh-cw" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

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
                  <Feather name="chevron-down" size={10} color="#718096" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("START_MONTH")}
                >
                  <Text style={styles.triggerButtonText}>
                    {formatMonthLabel(startMonth)}
                  </Text>
                  <Feather name="chevron-down" size={10} color="#718096" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("START_DAY")}
                >
                  <Text style={styles.triggerButtonText}>{startDay}</Text>
                  <Feather name="chevron-down" size={10} color="#718096" />
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
                  <Feather name="chevron-down" size={10} color="#718096" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("END_MONTH")}
                >
                  <Text style={styles.triggerButtonText}>
                    {formatMonthLabel(endMonth)}
                  </Text>
                  <Feather name="chevron-down" size={10} color="#718096" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTriggerButton}
                  onPress={() => toggleDropdownPicker("END_DAY")}
                >
                  <Text style={styles.triggerButtonText}>{endDay}</Text>
                  <Feather name="chevron-down" size={10} color="#718096" />
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
                  <Feather name="x" size={14} color="#A0AEC0" />
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
            <ActivityIndicator size="large" color="#1F2937" />
            <Text style={styles.historyLoaderText}>
              Synchronizing PostgreSQL Ledger...
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.historyScrollWindow}
            showsVerticalScrollIndicator={false}
          >
            {filteredMeals.length === 0 ? (
              <View style={styles.historyEmptyCardState}>
                <Feather name="calendar" size={34} color="#CBD5E0" />
                <Text style={styles.historyEmptyStateTitle}>
                  No Logs Within Timeframe
                </Text>
                <Text style={styles.historyEmptyStateSub}>
                  No automated plate scans found between{" "}
                  {formatMonthLabel(startMonth)} {startDay}, {startYear} and{" "}
                  {formatMonthLabel(endMonth)} {endDay}, {endYear}.
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
                      <View>
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

                      <View style={styles.yoloMicroBadge}>
                        <Text style={styles.yoloMicroText}>YOLOv8 AI</Text>
                      </View>
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

  // --- MAIN RENDER ROUTE: STANDARD SETTINGS & MACRO PROFILE CARD ---
  return (
    <View style={{ flex: 1 }}>
      {/* 🔑 MASTER CUSTOM TOAST LAYER NOTIFICATION WINDFALL CONTAINER */}
      <NotificationToast {...notification} onClose={hideNotification} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Master Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.fullName
                ? profile.fullName.charAt(0).toUpperCase()
                : "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{profile.fullName}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>

          <View style={styles.profileMetaRow}>
            <View style={styles.profileMetaChip}>
              <Text style={styles.profileMetaLabel}>Joined</Text>
              <Text style={styles.profileMetaValue}>{joinedDate}</Text>
            </View>
            <View style={styles.profileMetaChip}>
              <Text style={styles.profileMetaLabel}>Targets</Text>
              <Text style={styles.profileMetaValue}>4 macro goals</Text>
            </View>
          </View>
        </View>

        {/* 1b. Saved Personal Details */}
        <Text style={styles.sectionTitle}>Current Details</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.gender || "Not set"}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Age</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.age
                ? `${onboardingDetails.age} years`
                : "Not set"}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.weight
                ? `${onboardingDetails.weight} kg`
                : "Not set"}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Height</Text>
            <Text style={styles.detailValue}>
              {onboardingDetails?.height
                ? `${onboardingDetails.height} cm`
                : "Not set"}
            </Text>
          </View>
        </View>

        {/* 2. Nutritional Macro Targets Section */}
        <Text style={styles.sectionTitle}>Daily Metabolic Targets</Text>
        <View style={styles.macroGrid}>
          <View style={[styles.macroCard, { borderLeftColor: "#4A5568" }]}>
            <Text style={styles.macroLabel}>Energy Target</Text>
            <Text style={styles.macroValue}>
              {targets.calories} <Text style={styles.macroUnit}>kcal</Text>
            </Text>
          </View>

          <View style={[styles.macroCard, { borderLeftColor: "#3182CE" }]}>
            <Text style={styles.macroLabel}>Protein Target</Text>
            <Text style={styles.macroValue}>
              {targets.protein} <Text style={styles.macroUnit}>g</Text>
            </Text>
          </View>

          <View style={[styles.macroCard, { borderLeftColor: "#DD6B20" }]}>
            <Text style={styles.macroLabel}>Carbohydrates</Text>
            <Text style={styles.macroValue}>
              {targets.carbs} <Text style={styles.macroUnit}>g</Text>
            </Text>
          </View>

          <View style={[styles.macroCard, { borderLeftColor: "#E53E3E" }]}>
            <Text style={styles.macroLabel}>Lipids / Fats</Text>
            <Text style={styles.macroValue}>
              {targets.fats} <Text style={styles.macroUnit}>g</Text>
            </Text>
          </View>
        </View>

        {/* 3. Account Actions System Menu */}
        <Text style={styles.sectionTitle}>Workspace Settings</Text>
        <View style={styles.settingsMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setViewMode("HISTORY")}
          >
            <View style={styles.menuItemLeftGroup}>
              <Feather
                name="clock"
                size={16}
                color="#4B5563"
                style={styles.inlineMenuIcon}
              />
              <Text style={styles.menuItemText}>Itemized Scanning History</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
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
          >
            <View style={styles.menuItemLeftGroup}>
              <Feather
                name="sliders"
                size={16}
                color="#4B5563"
                style={styles.inlineMenuIcon}
              />
              <Text style={styles.menuItemText}>
                Edit Macro Allocation Profile
              </Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (onClearScanIndexes) {
                onClearScanIndexes();
                // 🔑 FIXED: Replaced native prompt with custom notification banner toast
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
          >
            <View style={styles.menuItemLeftGroup}>
              <Feather
                name="trash-2"
                size={16}
                color="#4B5563"
                style={styles.inlineMenuIcon}
              />
              <Text style={styles.menuItemText}>Clear Local Scan Indexes</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={onLogout}
          >
            <Text style={styles.logoutText}>Sign Out of Application</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerBranding}>
          Ghanaian Cuisine Local Food Analyzer v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  userName: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 16,
  },
  profileMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    width: "100%",
  },
  profileMetaChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F8F6F2",
    borderWidth: 1,
    borderColor: "#E7E0D8",
  },
  profileMetaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  profileMetaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  detailCard: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#F8F6F2",
    borderWidth: 1,
    borderColor: "#E7E0D8",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 28,
  },
  macroCard: {
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  macroValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  settingsMenu: {
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
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
    borderBottomColor: "#EDF2F7",
  },
  menuItemLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inlineMenuIcon: {
    marginTop: -1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  menuArrow: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  logoutItem: {
    borderBottomWidth: 0,
    backgroundColor: "#FFF6F5",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B4534B",
    textAlign: "center",
  },
  footerBranding: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 10,
  },

  // --- SUB-SCREEN COMPONENT CUSTOM STYLES ---
  historyContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  historyHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.4)",
    backgroundColor: "rgba(255, 251, 247, 0.96)",
  },
  backButtonInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
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
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
  },
  panelTitleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
    textTransform: "uppercase",
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
    fontWeight: "700",
    color: "#718096",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  selectorButtonsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  dropdownTriggerButton: {
    flex: 1,
    height: 38,
    backgroundColor: "#FFFFFF",
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
    fontWeight: "600",
    color: "#2D3748",
  },
  expandedTrayWrapper: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  trayHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trayTitleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A0AEC0",
    textTransform: "uppercase",
  },
  trayScrollContent: {
    paddingVertical: 4,
    gap: 6,
  },
  trayItemChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 6,
  },
  trayItemChipActive: {
    backgroundColor: "#1F2937",
    borderColor: "#1F2937",
  },
  trayChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
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
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 12,
  },
  historyScrollWindow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  historyEmptyCardState: {
    backgroundColor: "rgba(255, 251, 247, 0.5)",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.7)",
    marginTop: 20,
  },
  historyEmptyStateTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 12,
    marginBottom: 4,
  },
  historyEmptyStateSub: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
  historyRowCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyMealName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D3748",
  },
  historyMealTimestamp: {
    fontSize: 11,
    color: "#718096",
    fontWeight: "500",
    marginTop: 2,
  },
  historyCalorieCount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  historyMacroPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F7FAFC",
  },
  inlineMacroPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4A5568",
  },
  yoloMicroBadge: {
    backgroundColor: "rgba(56, 161, 105, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: "auto",
  },
  yoloMicroText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#276749",
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
