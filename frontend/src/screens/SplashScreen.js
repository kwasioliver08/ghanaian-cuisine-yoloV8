import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * SplashScreen Component
 * Displays rich branding with vision_finder background before routing
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
    <ImageBackground
      source={require("../../assets/vision_finder.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Dim Overlay for contrast */}
      <View style={styles.backgroundDimOverlay} />

      <View style={styles.content}>
        {/* Top Branding Section */}
        <View style={styles.brandingSection}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="camera" size={32} color="#FFFFFF" />
          </View>

          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>LOCAL AI FOOD LOG</Text>
          </View>

          <Text style={styles.titleText}>Ghanaian Cuisine</Text>
          <Text style={styles.subtitleText}>
            Scan meals, estimate nutrition, and track daily goals with YOLOv8.
          </Text>
        </View>

        {/* Frosted Glass Loading Card */}
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#963E00" />
          <Text style={styles.loadingText}>Initializing Workspace</Text>
          <Text style={styles.loadingSubtext}>
            Preparing nutrition tracking & plate intelligence...
          </Text>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.versionText}>v1.0.0 • Powered by YOLOv8</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundDimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.OS === "android" ? 54 : 40,
    paddingHorizontal: 24,
  },
  brandingSection: {
    alignItems: "center",
    marginTop: 80,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#963E00",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginBottom: 14,
  },
  brandChipText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#FFFFFF",
  },
  titleText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F8F6F2",
    textAlign: "center",
    maxWidth: 270,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  loadingText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginTop: 14,
    fontWeight: "800",
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#F1EFEA",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
  footerSection: {
    alignItems: "center",
  },
  versionText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
