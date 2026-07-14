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
  Platform, // FIXED: Added missing Platform import
} from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// Importing SVG elements to draw custom vector overlays over our photo
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = width - 40; // The fixed square layout bounds for our preview window

/**
 * ScannerScreen Component
 * Handles photo ingestion and visually renders bounding box canvas overlays
 * Section 3.7 Technical Requirement: Computer Vision Visual Interface
 */
const ScannerScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictions, setPredictions] = useState([]); // Stores spatial coordinate arrays

  /**
   * Simulated YOLOv8 API response payload mapping localized food items.
   * Coordinates are structured relative to our display frame size (CANVAS_SIZE).
   */
  const MOCK_YOLO_RESPONSE = [
    {
      class: "waakye",
      confidence: 0.94,
      box: {
        x: CANVAS_SIZE * 0.12, // 12% from the left edge
        y: CANVAS_SIZE * 0.2, // 20% from the top edge
        w: CANVAS_SIZE * 0.55, // Width covering 55% of canvas
        h: CANVAS_SIZE * 0.6, // Height covering 60% of canvas
      },
    },
    {
      class: "plantain",
      confidence: 0.88,
      box: {
        x: CANVAS_SIZE * 0.65, // 65% from the left edge
        y: CANVAS_SIZE * 0.35, // 35% from the top edge
        w: CANVAS_SIZE * 0.28, // Width covering 28% of canvas
        h: CANVAS_SIZE * 0.4, // Height covering 40% of canvas
      },
    },
  ];

  const handleCapturePhoto = async () => {
    setPredictions([]); // Clear past model canvas boundaries
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to scan plates.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], // FIXED: Updated deprecated code array syntax
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
      mediaTypes: ["images"], // FIXED: Updated deprecated code array syntax
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  /**
   * Triggers simulated AI inference execution, injecting bounding box coordinate nodes
   */
  const handleProcessImage = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      // Injecting our mock data matrix to overlay vector boxes on our photo frame
      setPredictions(MOCK_YOLO_RESPONSE);
    }, 2000);
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
                      stroke="#38A169" // Emerald Green accent for confident detections
                      strokeWidth="3"
                      fill="rgba(56, 161, 105, 0.12)" // Semi-transparent overlay mask fill
                      rx="6" // Softly rounded border corners
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
                  Running Local YOLOv8 Inference...
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
    backgroundColor: "rgba(255, 255, 255, 0.72)",
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
