import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, StatusBar, Text } from "react-native";
import SplashScreen from "./src/screens/SplashScreen";
import AuthScreen from "./src/screens/AuthScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

// Temporary fallback container while we build your main dashboard screen next
const TemporaryCoreAppHub = ({ user, targets }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F7FAFC",
      padding: 20,
    }}
  >
    <Text
      style={{
        fontSize: 22,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 10,
      }}
    >
      Core App Dashboard Unlocked
    </Text>
    <Text style={{ fontSize: 14, color: "#4A5568", marginBottom: 30 }}>
      Authenticated: {user?.fullName || "User"}
    </Text>

    <View
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <Text style={{ fontWeight: "700", color: "#2D3748", marginBottom: 12 }}>
        Active Targets:
      </Text>
      <Text style={{ color: "#4A5568", marginVertical: 4 }}>
        Calories: {targets?.calories} kcal
      </Text>
      <Text style={{ color: "#4A5568", marginVertical: 4 }}>
        Carbohydrates: {targets?.carbs}g
      </Text>
      <Text style={{ color: "#4A5568", marginVertical: 4 }}>
        Protein: {targets?.protein}g
      </Text>
      <Text style={{ color: "#4A5568", marginVertical: 4 }}>
        Fats: {targets?.fats}g
      </Text>
    </View>
  </View>
);

export default function App() {
  const [currentViewState, setCurrentViewState] = useState("SPLASH"); // State machine tracker
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
        return (
          <TemporaryCoreAppHub user={userProfile} targets={dailyTargets} />
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
