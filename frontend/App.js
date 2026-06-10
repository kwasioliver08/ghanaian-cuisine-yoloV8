import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Simulated YOLOv8 API response for Ghanaian dishes
  const mockDetectionResult = {
    dish: "Gari Foto & Fried Plantain",
    confidence: "94.2%",
    macros: { calories: 650, protein: "14g", carbs: "88g", fats: "22g" },
    box: { top: "35%", left: "20%", width: "55%", height: "40%" },
  };

  const pickImage = async () => {
    // Request permission to access system gallery
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access the camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      simulateInference();
    }
  };

  const takePhoto = async () => {
    // Request permission to access device camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access the camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      simulateInference();
    }
  };

  const simulateInference = () => {
    setLoading(true);
    setShowResults(false);

    // Simulate the server latency of a Python FastAPI pipeline
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 1800);
  };

  const resetScanner = () => {
    setImage(null);
    setShowResults(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local Food AI Scanner</Text>
        <Text style={styles.headerSubtitle}>KNUST CS Dept. Prototype</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main Viewfinder Workspace */}
        <View style={styles.viewfinderContainer}>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.capturedImage} />

              {/* Dynamic YOLOv8 Bounding Box Overlay Simulation */}
              {showResults && (
                <View
                  style={[
                    styles.boundingBox,
                    {
                      top: mockDetectionResult.box.top,
                      left: mockDetectionResult.box.left,
                      width: mockDetectionResult.box.width,
                      height: mockDetectionResult.box.height,
                    },
                  ]}
                >
                  <Text style={styles.boxLabel}>
                    {mockDetectionResult.dish} ({mockDetectionResult.confidence}
                    )
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>No Image Selected</Text>
              <Text style={styles.placeholderSubText}>
                Snapshot or select a meal entry to trigger computer vision
                analysis
              </Text>
            </View>
          )}

          {/* Activity Inference Indicator */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                Running YOLOv8 Localization...
              </Text>
            </View>
          )}
        </View>

        {/* Nutritional Dashboard Result Module */}
        {showResults && (
          <View style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>
              Nutritional Composition Summary
            </Text>

            <View style={styles.macroGrid}>
              <View style={[styles.macroBox, { borderColor: "#FF3B30" }]}>
                <Text style={styles.macroValue}>
                  {mockDetectionResult.macros.calories}
                </Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={[styles.macroBox, { borderColor: "#4CD964" }]}>
                <Text style={styles.macroValue}>
                  {mockDetectionResult.macros.carbs}
                </Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={[styles.macroBox, { borderColor: "#FFCC00" }]}>
                <Text style={styles.macroValue}>
                  {mockDetectionResult.macros.protein}
                </Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={[styles.macroBox, { borderColor: "#5AC8FA" }]}>
                <Text style={styles.macroValue}>
                  {mockDetectionResult.macros.fats}
                </Text>
                <Text style={styles.macroLabel}>Fats</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Control Action Tray */}
      <View style={styles.actionTray}>
        {!image ? (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={takePhoto}
            >
              <Text style={styles.btnText}>Launch Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={pickImage}
            >
              <Text style={styles.btnText}>Open Gallery</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnDanger]}
            onPress={resetScanner}
          >
            <Text style={styles.btnText}>Clear & Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  scrollContainer: { paddingBottom: 100 },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#1A202C" },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#718096",
    marginTop: 4,
  },
  viewfinderContainer: {
    margin: 20,
    height: 320,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    borderHorizontalWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: { width: "100%", height: "100%", position: "relative" },
  capturedImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  placeholderText: { fontSize: 16, fontWeight: "600", color: "#4A5568" },
  placeholderSubText: {
    fontSize: 12,
    color: "#A0AEC0",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
  },
  boundingBox: {
    position: "absolute",
    borderHorizontalWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "rgba(0,122,255,0.15)",
    borderRadius: 4,
    padding: 2,
  },
  boxLabel: {
    position: "absolute",
    top: -22,
    left: -2,
    backgroundColor: "#007AFF",
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  dashboardCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dashboardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 15,
  },
  macroGrid: { flexDirection: "row", justifyContent: "space-between" },
  macroBox: {
    width: "23%",
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 3,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  macroValue: { fontSize: 16, fontWeight: "700", color: "#1A202C" },
  macroLabel: {
    fontSize: 10,
    color: "#718096",
    marginTop: 4,
    fontWeight: "500",
  },
  actionTray: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  btnPrimary: { backgroundColor: "#007AFF" },
  btnSecondary: { backgroundColor: "#4CD964" },
  btnDanger: { backgroundColor: "#FF3B30" },
  btnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
});
