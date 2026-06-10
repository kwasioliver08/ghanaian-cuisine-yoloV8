import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, StatusBar } from "react-native";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const [currentViewState, setCurrentViewState] = useState("SPLASH"); // Global layout router state
  const [userProfile, setUserProfile] = useState(null);
  const [dailyTargets, setDailyTargets] = useState(null);

  // 1. Handles transition out of the initial splash timer loop
  const handleSplashComplete = () => {
    setCurrentViewState("AUTH");
  };

  // 2. Intercepts the user object from AuthScreen and determines the logical route
  const handleAuthSuccess = (userPayload) => {
    setUserProfile(userPayload);

    if (userPayload.isNewUser) {
      setCurrentViewState("ONBOARDING");
    } else {
      // Returning users bypass setup and load their saved metrics profile directly
      setDailyTargets({ calories: 2150, carbs: 295, protein: 108, fats: 60 });
      setCurrentViewState("CORE_APP");
    }
  };

  // 3. Collects computed metabolic data arrays from setup and unlocks the workspace
  const handleOnboardingComplete = (computedTargets) => {
    setDailyTargets(computedTargets);
    setCurrentViewState("CORE_APP");
  };

  // 4. Handles user sign out to reset state variables and cycle safely back to AuthScreen
  const handleLogout = () => {
    setUserProfile(null);
    setDailyTargets(null);
    setCurrentViewState("AUTH");
  };

  // Core Render Matrix Switch
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
            userProfile={userProfile}
          />
        );
      case "CORE_APP":
        // FIXED: Now correctly rendering your production HomeScreen component!
        return (
          <HomeScreen
            userProfile={userProfile}
            dailyTargets={dailyTargets}
            onLogout={handleLogout}
          />
        );
      default:
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }
  };

  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <View style={styles.mainCanvas}>{renderViewLayer()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  mainCanvas: {
    flex: 1,
  },
});
