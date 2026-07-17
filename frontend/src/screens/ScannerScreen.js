import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";
// --- IMPORT THE LIVE API HELPER ---
import { api } from "../utils/api";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = width - 40;

/**
 * ScannerScreen Component
 * Handles photo ingestion and visually renders bounding box canvas overlays from FastAPI
 */
const ScannerScreen = ({ userProfile, onScanSuccess }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const handleCapturePhoto = async () => {
    setPredictions([]);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to scan plates.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSelectFromGallery = async () => {
    setPredictions([]);
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  /**
   * Fires multipart form-data to FastAPI backend and persists nutritional aggregations
   */
  const handleProcessImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);

    try {
      // 1. Post image binary stream up to /api/scan workspace route
      const response = await api.uploadAndScanPlate(selectedImage);

      if (response && response.predictions) {
        setPredictions(response.predictions);

        // 2. Map structural placeholders for local food estimation models
        // When your YOLO model details change, your estimation matrices parse dynamically here:
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFats = 0;
        let constructedNameList = [];

        response.predictions.forEach((item) => {
          constructedNameList.push(item.class.toUpperCase());
          if (item.class.toLowerCase() === "waakye") {
            totalCalories += 650;
            totalCarbs += 95;
            totalProtein += 22;
            totalFats += 14;
          } else if (item.class.toLowerCase() === "plantain") {
            totalCalories += 240;
            totalCarbs += 38;
            totalProtein += 8;
            totalFats += 9;
          } else {
            totalCalories += 300;
            totalCarbs += 40;
            totalProtein += 15;
            totalFats += 5;
          }
        });

        const unifiedMealName =
          constructedNameList.join(" & ") || "Detected Ghanaian Plate";

        // 3. Persist the detected meal into your PostgreSQL table ledger immediately
        await api.logMeal(
          userProfile?.id || "anonymous_user",
          "AI Scan",
          unifiedMealName,
          totalCalories,
          totalCarbs,
          totalProtein,
          totalFats,
          true, // marks item as YOLOv8 AI sourced
        );

        Alert.alert(
          "Analysis Complete",
          `Logged: ${unifiedMealName}\nCalculated ~${totalCalories} kcal added to your timeline dashboard layout!`,
          [
            {
              text: "Great",
              onPress: () => {
                if (onScanSuccess) onScanSuccess();
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error("Plate Scanning Error:", error);
      Alert.alert(
        "Scanning Error",
        error.message ||
          "Failed to establish validation handshake with YOLO API endpoint.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCanvas = () => {
    setSelectedImage(null);
    setPredictions([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.scannerBadge}>
          <Text style={styles.scannerBadgeText}>PLATE INTELLIGENCE</Text>
        </View>
        <Text style={styles.screenTitle}>AI Vision Viewfinder</Text>
        <Text style={styles.screenSubtitle}>
          Capture your plate for real-time item segmentation
        </Text>
      </View>

      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Scan a meal in one tap.</Text>
        <Text style={styles.introText}>
          Use the camera or your gallery, then let the model detect plate items
          and overlay clean bounding boxes.
        </Text>
      </View>

      {/* Main Core Preview Window Display */}
      <View style={styles.previewBoxContainer}>
        {selectedImage ? (
          <View style={styles.imageCanvasWrapper}>
            {/* Base Food Plate Layer */}
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />

            {/* Absolute Overlay SVG Canvas Drawing Engine */}
            {predictions.length > 0 && (
              <Svg
                style={StyleSheet.absoluteFillObject}
                viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              >
                {predictions.map((item, index) => (
                  <G key={`pred_${index}`}>
                    {/* 1. Spatial Outer Boundary Frame */}
                    <Rect
                      x={item.box.x}
                      y={item.box.y}
                      width={item.box.w}
                      height={item.box.h}
                      stroke="#38A169"
                      strokeWidth="3"
                      fill="rgba(56, 161, 105, 0.12)"
                      rx="6"
                    />

                    {/* 2. Metadata Identification Header Badge Text */}
                    <SvgText
                      x={item.box.x + 6}
                      y={item.box.y - 8}
                      fill="#38A169"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily={
                        Platform.OS === "ios"
                          ? "Helvetica Neue"
                          : "sans-serif-condensed"
                      }
                    >
                      {`${item.class.toUpperCase()} ${(item.confidence * 100).toFixed(0)}%`}
                    </SvgText>
                  </G>
                ))}
              </Svg>
            )}

            {/* Active Network Loading Wheel Block */}
            {isProcessing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>
                  Querying Live FastAPI YOLOv8 Workspace...
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyPreviewState}>
            <FontAwesome name="camera" size={44} color="#CBD5E0" />
            <Text style={styles.emptyStateText}>No Plate Selected</Text>
            <Text style={styles.emptyStateSubtext}>
              Snap a fresh field photo or pick an existing sample dataset array
              from your phone gallery.
            </Text>
          </View>
        )}
      </View>

      {/* Action Triggers Grid Row */}
      <View style={styles.actionButtonRow}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleCapturePhoto}
          disabled={isProcessing}
        >
          <Feather name="camera" size={18} color="#2D3748" />
          <Text style={styles.mediaButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleSelectFromGallery}
          disabled={isProcessing}
        >
          <Feather name="image" size={18} color="#2D3748" />
          <Text style={styles.mediaButtonText}>From Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Analytical Trigger Operations Control */}
      {selectedImage && predictions.length === 0 && !isProcessing && (
        <TouchableOpacity
          style={styles.processModelButton}
          onPress={handleProcessImage}
        >
          <Text style={styles.processModelButtonText}>
            Analyze Plate Composition
          </Text>
        </TouchableOpacity>
      )}

      {/* Clear Active Selection Canvas State */}
      {selectedImage && !isProcessing && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCanvas}
        >
          <Text style={styles.clearButtonText}>Clear Image Canvas</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20,
  },
  headerSection: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  scannerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    marginBottom: 10,
  },
  scannerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 27,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -0.7,
  },
  screenSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 4,
  },
  previewBoxContainer: {
    width: "100%",
    height: CANVAS_SIZE,
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
  },
  introCard: {
    backgroundColor: "rgba(255, 255, 272, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(231, 229, 223, 0.9)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  introText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
  emptyPreviewState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  imageCanvasWrapper: {
    flex: 1,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31, 41, 55, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
  },
  actionButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
    width: "100%",
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    height: 46,
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E0D8",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  processModelButton: {
    height: 50,
    backgroundColor: "#1F2937",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  processModelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B4534B",
  },
});

export default ScannerScreen;
