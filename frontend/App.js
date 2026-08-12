import React, { useState } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import MainTabNavigator from "./src/screens/MainTabNavigator";
// --- 🔑 IMPORT GLOBAL NOTIFICATION INFRASTRUCTURE ---
import NotificationToast from "./src/components/NotificationToast";
import { useNotification } from "./src/hooks/useNotification";

export default function App() {
  const [currentViewState, setCurrentViewState] = useState("SPLASH");
  const [userProfile, setUserProfile] = useState(null);
  const [dailyTargets, setDailyTargets] = useState(null);
  const [onboardingDetails, setOnboardingDetails] = useState(null);
  const [scannerResetKey, setScannerResetKey] = useState(0);

  // 🔑 INITIALIZE MASTER NOTIFICATION HOOK
  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleSplashComplete = () => {
    setCurrentViewState("AUTH");
  };

  const handleAuthSuccess = (userPayload) => {
    setUserProfile({
      ...userPayload,
      joinedDate:
        userPayload.joinedDate ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
    });

    if (userPayload.isNewUser) {
      setOnboardingDetails(null);
      setDailyTargets(null);
      setCurrentViewState("ONBOARDING");
    } else {
      const details = userPayload.onboardingDetails ||
        userPayload.profile_details || {
          gender: userPayload.gender || "Not set",
          age: userPayload.age || null,
          weight: userPayload.weight || null,
          height: userPayload.height || null,
        };

      const targets = userPayload.dailyTargets ||
        userPayload.computed_targets || {
          calories: userPayload.target_calories || 2150,
          carbs: userPayload.target_carbs || 295,
          protein: userPayload.target_protein || 108,
          fats: userPayload.target_fats || 60,
        };

      setOnboardingDetails(details);
      setDailyTargets(targets);
      setCurrentViewState("CORE_APP");
      showNotification(
        "Welcome back, " + (userPayload.fullName || "User") + "!",
        "success",
      );
    }
  };

  const handleOnboardingComplete = ({ computedTargets, details }) => {
    setDailyTargets(computedTargets);
    setOnboardingDetails(details);
    setCurrentViewState("CORE_APP");
    showNotification(
      "Nutritional profile synchronized successfully!",
      "success",
    );
  };

  const handleLogout = () => {
    setUserProfile(null);
    setDailyTargets(null);
    setOnboardingDetails(null);
    setCurrentViewState("AUTH");
    showNotification("Signed out safely.", "info");
  };

  const handleEditMacroAllocation = () => {
    setCurrentViewState("ONBOARDING");
  };

  const handleCancelMacroAllocationEdit = () => {
    setCurrentViewState("CORE_APP");
  };

  const handleClearScanIndexes = () => {
    setScannerResetKey((currentKey) => currentKey + 1);
  };

  const renderViewLayer = () => {
    switch (currentViewState) {
      case "SPLASH":
        return <SplashScreen onSplashComplete={handleSplashComplete} />;
      case "AUTH":
        return (
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            showNotification={showNotification}
          />
        );
      case "ONBOARDING":
        return (
          <OnboardingScreen
            onOnboardingComplete={handleOnboardingComplete}
            onCancel={handleCancelMacroAllocationEdit}
            userProfile={userProfile}
            currentTarget={dailyTargets}
            currentDetails={onboardingDetails}
            isEditingMacroAllocation={Boolean(dailyTargets)}
            showNotification={showNotification}
          />
        );
      case "CORE_APP":
        return (
          <MainTabNavigator
            userProfile={userProfile}
            dailyTargets={dailyTargets}
            onboardingDetails={onboardingDetails}
            onLogout={handleLogout}
            scannerResetKey={scannerResetKey}
            onEditMacroAllocation={handleEditMacroAllocation}
            onClearScanIndexes={handleClearScanIndexes}
            showNotification={showNotification}
          />
        );
      default:
        return (
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            showNotification={showNotification}
          />
        );
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 🔑 MASTER NOTIFICATION LAYER HOVER STACK */}
      <NotificationToast {...notification} onClose={hideNotification} />

      <View style={styles.appWrapper}>
        <View style={styles.mainCanvas}>{renderViewLayer()}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  appWrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mainCanvas: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
