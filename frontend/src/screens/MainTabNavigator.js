import React, { useState } from "react";
import ScannerScreen from "./ScannerScreen";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from "react-native";
// Added FontAwesome to pull the exact camera hardware design shape
import {
  Feather,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import HomeScreen from "./HomeScreen";

// 1. Temporary Placeholder for the AI Scanner Screen
const PlaceholderScannerScreen = () => (
  <View style={styles.placeholderContainer}>
    <FontAwesome
      name="camera"
      size={48}
      color="#A0AEC0"
      style={{ marginBottom: 16 }}
    />
    <Text style={styles.placeholderTitle}>AI Vision Scanner</Text>
    <Text style={styles.placeholderSubtext}>
      YOLOv8 Local Viewfinder Workspace initializing...
    </Text>
  </View>
);

// 2. Temporary Placeholder for the Analytics / Profile Settings Screen
const PlaceholderProfileScreen = ({ onLogout }) => (
  <View style={styles.placeholderContainer}>
    <Feather
      name="user"
      size={48}
      color="#A0AEC0"
      style={{ marginBottom: 16 }}
    />
    <Text style={styles.placeholderTitle}>Profile & Metrics</Text>
    <Text style={styles.placeholderSubtext}>
      Manage your metabolic target calculations here.
    </Text>

    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
      <Text style={styles.logoutButtonText}>Sign Out of Session</Text>
    </TouchableOpacity>
  </View>
);

const MainTabNavigator = ({ userProfile, dailyTargets, onLogout }) => {
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
        return <ScannerScreen />;
      case "PROFILE":
        return <PlaceholderProfileScreen onLogout={onLogout} />;
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
            color={activeTab === "DASHBOARD" ? "#2D3748" : "#A0AEC0"}
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
            {/* Swapped to matching classic camera hardware icon shape */}
            <FontAwesome name="camera" size={18} color="#FFFFFF" />
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
            color={activeTab === "PROFILE" ? "#2D3748" : "#A0AEC0"}
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
    backgroundColor: "#F7FAFC",
  },
  contentCanvas: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: "row",
    height: 68,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: Platform.OS === "ios" ? 14 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 4,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A0AEC0",
    marginTop: 5,
  },
  activeTabLabel: {
    color: "#2D3748",
    fontWeight: "700",
  },
  scannerCenterPill: {
    backgroundColor: "#A0AEC0",
    width: 48,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -2,
  },
  scannerCenterPillActive: {
    backgroundColor: "#2D3748",
  },
  scannerLabelAdjustment: {
    marginTop: 5,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: "#718096",
    textAlign: "center",
    marginBottom: 24,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#C53030",
  },
});

export default MainTabNavigator;
