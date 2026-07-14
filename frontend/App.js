import React, { useState } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import MainTabNavigator from "./src/screens/MainTabNavigator";
import AppBackground from "./src/components/AppBackground"; // Root wrapper!

export default function App() {
  const [currentViewState, setCurrentViewState] = useState("SPLASH");
  const [userProfile, setUserProfile] = useState(null);
  const [dailyTargets, setDailyTargets] = useState(null);
  const [onboardingDetails, setOnboardingDetails] = useState(null);
  const [scannerResetKey, setScannerResetKey] = useState(0);

  const handleSplashComplete = () => {
    setCurrentViewState("AUTH");
  };

  const handleAuthSuccess = (userPayload) => {
    setOnboardingDetails(null);
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
      setCurrentViewState("ONBOARDING");
    } else {
      setDailyTargets({ calories: 2150, carbs: 295, protein: 108, fats: 60 });
      setCurrentViewState("CORE_APP");
    }
  };

  const handleOnboardingComplete = ({ computedTargets, details }) => {
    setDailyTargets(computedTargets);
    setOnboardingDetails(details);
    setCurrentViewState("CORE_APP");
  };

  const handleLogout = () => {
    setUserProfile(null);
    setDailyTargets(null);
    setOnboardingDetails(null);
    setCurrentViewState("AUTH");
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
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case "ONBOARDING":
        return (
          <OnboardingScreen
            onOnboardingComplete={handleOnboardingComplete}
            onCancel={handleCancelMacroAllocationEdit}
            userProfile={userProfile}
            currentTargets={dailyTargets}
            currentDetails={onboardingDetails}
            isEditingMacroAllocation={Boolean(dailyTargets)}
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
          />
        );
      default:
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }
  };

  return (
    // Putting the background at the top-level of the hierarchy resolves all layout blocking!
    <AppBackground>
      {/* status bar translucent tells android not to reserve solid white blocks */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.appWrapper}>
        <View style={styles.mainCanvas}>{renderViewLayer()}</View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mainCanvas: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
