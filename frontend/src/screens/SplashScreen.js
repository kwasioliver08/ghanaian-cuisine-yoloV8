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
      <View style={styles.brandHalo} />
      <View style={styles.brandHaloSecondary} />

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.brandingSection}>
          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>LOCAL AI FOOD LOG</Text>
          </View>
          <Text style={styles.titleText}>Ghanaian Cuisine</Text>
          <Text style={styles.subtitleText}>Scan meals, calculate targets, and track the day.</Text>
        </View>

        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.loadingText}>Initializing your workspace</Text>
          <Text style={styles.loadingSubtext}>Preparing nutrition tracking and plate intelligence.</Text>
        </View>

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
    backgroundColor: "#F7F3ED",
    justifyContent: "center",
    alignItems: "center",
  },
  brandHalo: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    top: -40,
    right: -70,
    backgroundColor: "rgba(37, 99, 235, 0.24)",
  },
  brandHaloSecondary: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    bottom: 40,
    left: -70,
    backgroundColor: "rgba(16, 185, 129, 0.18)",
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 20,
  },
  brandingSection: {
    alignItems: "center",
    marginTop: 120,
  },
  brandChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.95)",
    marginBottom: 18,
  },
  brandChipText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#2563EB",
  },
  titleText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#475569",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 260,
  },
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.95)",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  loadingSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#0F172A",
    marginTop: 14,
    fontWeight: "700",
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#475569",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 220,
  },
  footerSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  versionText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 10,
  },
});

export default SplashScreen;
