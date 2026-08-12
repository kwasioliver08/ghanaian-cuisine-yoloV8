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
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  const isScannerActive = activeTab === "SCANNER";

  const renderTabContent = () => {
    switch (activeTab) {
      case "DASHBOARD":
        return (
          <HomeScreen
            userProfile={userProfile}
            dailyTargets={dailyTargets}
            onLogout={onLogout}
            onNavigateToScanner={() => setActiveTab("SCANNER")}
            onNavigateToHistory={() => setActiveTab("PROFILE")}
          />
        );
      case "SCANNER":
        return (
          <ScannerScreen
            key={scannerResetKey}
            userProfile={userProfile}
            onScanSuccess={() => setActiveTab("DASHBOARD")}
          />
        );
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
    <SafeAreaView
      style={[styles.container, isScannerActive && styles.containerTranslucent]}
    >
      {/* Target Render Layer Window */}
      <View style={styles.contentCanvas}>{renderTabContent()}</View>

      {/* Bottom Dynamic Navigation Bar */}
      <View
        style={[
          styles.tabBarContainer,
          isScannerActive && styles.tabBarTranslucent,
        ]}
      >
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("DASHBOARD")}
          activeOpacity={0.8}
        >
          {activeTab === "DASHBOARD" ? (
            <View style={styles.activeTabGroup}>
              <View style={styles.activeCircleBadge}>
                <MaterialCommunityIcons name="home" size={20} color="#FFFFFF" />
              </View>
              <Text
                style={[
                  styles.activeTabLabel,
                  isScannerActive && styles.activeTabLabelTranslucent,
                ]}
              >
                Home
              </Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name="home-outline"
                size={22}
                color={isScannerActive ? "#FFFFFF" : "#6B5A4E"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isScannerActive && styles.tabLabelTranslucent,
                ]}
              >
                Home
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Scan Plate Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("SCANNER")}
          activeOpacity={0.8}
        >
          {activeTab === "SCANNER" ? (
            <View style={styles.activeTabGroup}>
              <View style={styles.activeCircleBadge}>
                <MaterialCommunityIcons
                  name="camera"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[
                  styles.activeTabLabel,
                  styles.activeTabLabelTranslucent,
                ]}
              >
                Scan Plate
              </Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name="camera-outline"
                size={22}
                color="#6B5A4E"
              />
              <Text style={styles.tabLabel}>Scan Plate</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("PROFILE")}
          activeOpacity={0.8}
        >
          {activeTab === "PROFILE" ? (
            <View style={styles.activeTabGroup}>
              <View style={styles.activeCircleBadge}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[
                  styles.activeTabLabel,
                  isScannerActive && styles.activeTabLabelTranslucent,
                ]}
              >
                Profile
              </Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={isScannerActive ? "#FFFFFF" : "#6B5A4E"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isScannerActive && styles.tabLabelTranslucent,
                ]}
              >
                Profile
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  containerTranslucent: {
    backgroundColor: "transparent",
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 72,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingBottom: Platform.OS === "ios" ? 12 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 8,
  },
  // 🔑 Glass Frosted effect styled using pure RGBA (Identical to ScannerScreen components)
  tabBarTranslucent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.35)",
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B5A4E",
    marginTop: 3,
  },
  tabLabelTranslucent: {
    color: "#FFFFFF",
  },
  activeTabGroup: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircleBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
    shadowColor: "#963E00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  activeTabLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#963E00",
  },
  activeTabLabelTranslucent: {
    color: "#FFFFFF",
  },
});

export default MainTabNavigator;
