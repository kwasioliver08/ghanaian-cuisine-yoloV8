import React, { useState } from "react";
import ScannerScreen from "./ScannerScreen";
import ProfileScreen from "./ProfileScreen";
import HomeScreen from "./HomeScreen";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const MainTabNavigator = ({
  userProfile,
  dailyTargets,
  onboardingDetails,
  onLogout,
  scannerResetKey,
  onEditMacroAllocation,
  onClearScanIndexes,
}) => {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const renderTabContent = () => {
    switch (activeTab) {
      case "DASHBOARD":
        return (
          <HomeScreen
            userProfile={userProfile}
            dailyTargets={dailyTargets}
            onLogout={onLogout}
            onNavigateToScanner={() => setActiveTab("SCANNER")}
          />
        );
      case "SCANNER":
        return <ScannerScreen key={scannerResetKey} />;
      case "PROFILE":
        return (
          <ProfileScreen
            userProfile={userProfile}
            dailyTargets={dailyTargets}
            onboardingDetails={onboardingDetails}
            onLogout={onLogout}
            onEditMacroAllocation={onEditMacroAllocation}
            onClearScanIndexes={onClearScanIndexes}
          />
        );
      default:
        return (
          <HomeScreen
            userProfile={userProfile}
            dailyTargets={dailyTargets}
            onLogout={onLogout}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Target Render Layer Window */}
      <View style={styles.contentCanvas}>{renderTabContent()}</View>

      {/* Bottom Floating Navigation Tab Bar */}
      <View style={styles.tabBarContainer}>
        {/* Dashboard Navigation Trigger */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("DASHBOARD")}
          activeOpacity={0.7}
        >
          <Feather
            name="home"
            size={22}
            color={activeTab === "DASHBOARD" ? "#0F172A" : "#94A3B8"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "DASHBOARD" && styles.activeTabLabel,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* AI Vision Scanner Navigation Trigger (Pill Style) */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("SCANNER")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.scannerCenterPill,
              activeTab === "SCANNER" && styles.scannerCenterPillActive,
            ]}
          >
            <Feather name="camera" size={18} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.tabLabel,
              styles.scannerLabelAdjustment,
              activeTab === "SCANNER" && styles.activeTabLabel,
            ]}
          >
            Scan Plate
          </Text>
        </TouchableOpacity>

        {/* Profile Settings Navigation Trigger */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("PROFILE")}
          activeOpacity={0.7}
        >
          <Feather
            name="user"
            size={22}
            color={activeTab === "PROFILE" ? "#0F172A" : "#94A3B8"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "PROFILE" && styles.activeTabLabel,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 76,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.95)",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 14 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 5,
  },
  activeTabLabel: {
    color: "#0F172A",
    fontWeight: "700",
  },
  scannerCenterPill: {
    backgroundColor: "#0F172A",
    width: 54,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },
  scannerCenterPillActive: {
    backgroundColor: "#0F172A",
  },
  scannerLabelAdjustment: {
    marginTop: 4,
  },
});

export default MainTabNavigator;
