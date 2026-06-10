import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

/**
 * SplashScreen Component
 * Displays branding and performs background authentication checks
 * Renders for 2-3 seconds before routing to next screen
 */
const SplashScreen = ({ onSplashComplete }) => {
  useEffect(() => {
    // Simulate auth check and display splash for 2.5 seconds
    const timer = setTimeout(() => {
      if (onSplashComplete) {
        onSplashComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onSplashComplete]);

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundGradient} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo / Branding Section */}
        <View style={styles.brandingSection}>
          <Text style={styles.titleText}>GHANAIAN CUISINE</Text>
          <Text style={styles.subtitleText}>Food Detection & Nutrition</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color="#2D3748" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>

        {/* Footer Branding */}
        <View style={styles.footerSection}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F7FAFC",
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  brandingSection: {
    alignItems: "center",
    marginTop: 120, // Pushed down slightly since top text is gone
  },
  titleText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4A5568",
    marginTop: 8,
  },
  loadingSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#4A5568",
    marginTop: 16,
    fontWeight: "500",
  },
  footerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  versionText: {
    fontSize: 11,
    color: "#A0AEC0",
    marginTop: 6,
  },
});

export default SplashScreen;
