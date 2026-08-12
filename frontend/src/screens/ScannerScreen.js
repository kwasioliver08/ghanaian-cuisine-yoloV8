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
  ImageBackground,
  ScrollView,
  Modal,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";
import { api } from "../utils/api";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = width - 40;

const ScannerScreen = ({ userProfile, onScanSuccess }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null); // Stores scan results prior to logging
  const [isLogging, setIsLogging] = useState(false);

  const handleCapturePhoto = async () => {
    setScanResult(null);
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
    setScanResult(null);
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
   * 1. Query FastAPI YOLOv8 Endpoint and open review modal
   */
  const handleProcessImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);

    try {
      const response = await api.uploadAndScanPlate(selectedImage);

      if (response && response.predictions) {
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFats = 0;
        let constructedNameList = [];
        let maxConfidence = 0;

        response.predictions.forEach((item) => {
          constructedNameList.push(
            item.class.charAt(0).toUpperCase() + item.class.slice(1),
          );
          if (item.confidence > maxConfidence) {
            maxConfidence = item.confidence;
          }

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
          } else if (
            item.class.toLowerCase() === "fufu" ||
            item.class.toLowerCase() === "light soup"
          ) {
            totalCalories += 640;
            totalCarbs += 125;
            totalProtein += 24;
            totalFats += 12;
          } else {
            totalCalories += 300;
            totalCarbs += 40;
            totalProtein += 15;
            totalFats += 5;
          }
        });

        const unifiedMealName =
          constructedNameList.join(" and ") || "Detected Ghanaian Plate";

        // Store intermediate data for user inspection on the Scan Result Screen
        setScanResult({
          imageUri: selectedImage,
          serverImageUrl: response.image_url || selectedImage,
          predictions: response.predictions,
          dishName: unifiedMealName,
          matchConfidence: Math.round((maxConfidence || 0.95) * 100),
          calories: totalCalories || 640,
          carbs: totalCarbs || 125,
          protein: totalProtein || 24,
          fats: totalFats || 12,
        });
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

  /**
   * 2. Commit meal to PostgreSQL database after user approves
   */
  const handleConfirmAddToLog = async () => {
    if (!scanResult) return;
    setIsLogging(true);

    try {
      await api.logMeal(
        userProfile?.id || "anonymous_user",
        "AI Scan",
        scanResult.dishName,
        scanResult.calories,
        scanResult.carbs,
        scanResult.protein,
        scanResult.fats,
        true,
        scanResult.serverImageUrl,
      );

      setScanResult(null);
      setSelectedImage(null);

      if (onScanSuccess) {
        onScanSuccess();
      }
    } catch (error) {
      console.error("Meal Logging Error:", error);
      Alert.alert("Error", "Could not log this meal to the database.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleClearCanvas = () => {
    setSelectedImage(null);
    setScanResult(null);
  };

  return (
    <ImageBackground
      source={require("../../assets/vision_finder.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundDimOverlay} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.scannerBadge}>
            <Text style={styles.scannerBadgeText}>PLATE INTELLIGENCE</Text>
          </View>
          <Text style={styles.screenTitle}>AI Vision Viewfinder</Text>
          <Text style={styles.screenSubtitle}>
            Capture your plate for real-time item segmentation
          </Text>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Scan a meal in one tap.</Text>
          <Text style={styles.introText}>
            Use the camera or your gallery, then let the model detect plate
            items and overlay clean bounding boxes.
          </Text>
        </View>

        {/* Viewfinder Preview Box */}
        <View style={styles.previewBoxContainer}>
          {selectedImage ? (
            <View style={styles.imageCanvasWrapper}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
              />

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
              <View style={styles.centerCameraCircle}>
                <Feather name="camera" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.emptyStateText}>No Plate Selected</Text>
              <Text style={styles.emptyStateSubtext}>
                Snap a fresh field photo or pick an existing sample dataset
                array from your phone gallery.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonRow}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleCapturePhoto}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Feather name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.mediaButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleSelectFromGallery}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Feather name="image" size={18} color="#FFFFFF" />
            <Text style={styles.mediaButtonText}>From Gallery</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && !isProcessing && (
          <TouchableOpacity
            style={styles.processModelButton}
            onPress={handleProcessImage}
            activeOpacity={0.8}
          >
            <Text style={styles.processModelButtonText}>
              Analyze Plate Composition
            </Text>
          </TouchableOpacity>
        )}

        {selectedImage && !isProcessing && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCanvas}
          >
            <Text style={styles.clearButtonText}>Clear Image Canvas</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* 🌟 SCAN RESULT REVIEW MODAL */}
      <Modal
        visible={!!scanResult}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setScanResult(null)}
      >
        {scanResult && (
          <View style={styles.resultModalRoot}>
            {/* Modal Header */}
            <View style={styles.resultModalHeader}>
              <TouchableOpacity
                onPress={() => setScanResult(null)}
                style={styles.backButton}
              >
                <Feather name="arrow-left" size={22} color="#4A2810" />
              </TouchableOpacity>
              <Text style={styles.resultModalTitle}>Scan Result</Text>
              <TouchableOpacity style={styles.moreButton}>
                <Feather name="more-vertical" size={20} color="#4A2810" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.resultModalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Preview with Overlay Bounding Boxes */}
              <View style={styles.resultImageCard}>
                <Image
                  source={{ uri: scanResult.imageUri }}
                  style={styles.resultImage}
                />

                {/* Svg Bounding Box Overlay Layer */}
                {scanResult.predictions.length > 0 && (
                  <Svg
                    style={StyleSheet.absoluteFillObject}
                    viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                  >
                    {scanResult.predictions.map((item, index) => (
                      <G key={`res_pred_${index}`}>
                        <Rect
                          x={item.box.x}
                          y={item.box.y}
                          width={item.box.w}
                          height={item.box.h}
                          stroke="#38A169"
                          strokeWidth="3"
                          fill="rgba(56, 161, 105, 0.18)"
                          rx="8"
                        />
                        <SvgText
                          x={item.box.x + 6}
                          y={item.box.y - 8}
                          fill="#FFFFFF"
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {`${item.class.toUpperCase()} ${(
                            item.confidence * 100
                          ).toFixed(0)}%`}
                        </SvgText>
                      </G>
                    ))}
                  </Svg>
                )}

                {/* Confidence Match Tag */}
                <View style={styles.matchBadge}>
                  <Feather name="check-circle" size={12} color="#FFFFFF" />
                  <Text style={styles.matchBadgeText}>
                    {scanResult.matchConfidence}% Match
                  </Text>
                </View>
              </View>

              {/* Dish Name */}
              <View style={styles.dishHeaderRow}>
                <View>
                  <Text style={styles.detectedTag}>DETECTED DISH</Text>
                  <Text style={styles.dishTitle}>{scanResult.dishName}</Text>
                </View>
              </View>

              {/* Nutrition Facts Section */}
              <Text style={styles.nutritionFactsTitle}>Nutrition Facts</Text>

              {/* Total Energy Card */}
              <View style={styles.energyCard}>
                <View style={styles.energyIconBox}>
                  <MaterialCommunityIcons
                    name="fire"
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.energyTextGroup}>
                  <Text style={styles.energyLabel}>Total Energy</Text>
                  <Text style={styles.energyValue}>
                    {scanResult.calories} kcal
                  </Text>
                </View>
              </View>

              {/* Macros Breakdown 2x2 Grid */}
              <View style={styles.macroGrid}>
                {/* Carbs */}
                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{scanResult.carbs}g</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { width: "70%", backgroundColor: "#4A2810" },
                      ]}
                    />
                  </View>
                </View>

                {/* Protein */}
                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{scanResult.protein}g</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { width: "50%", backgroundColor: "#1B5E20" },
                      ]}
                    />
                  </View>
                </View>

                {/* Fat */}
                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Fat</Text>
                  <Text style={styles.macroValue}>{scanResult.fats}g</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { width: "35%", backgroundColor: "#963E00" },
                      ]}
                    />
                  </View>
                </View>

                {/* Fiber */}
                <View style={styles.macroCard}>
                  <Text style={styles.macroLabel}>Fiber</Text>
                  <Text style={styles.macroValue}>8g</Text>
                  <View style={styles.macroBarBg}>
                    <View
                      style={[
                        styles.macroBarFill,
                        { width: "40%", backgroundColor: "#E06D14" },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Add to Log Main Button */}
              <TouchableOpacity
                style={styles.addToLogButton}
                onPress={handleConfirmAddToLog}
                disabled={isLogging}
                activeOpacity={0.85}
              >
                {isLogging ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="clipboard-plus-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.addToLogButtonText}>Add to Log</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>
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
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 44 : 20,
    paddingBottom: 110,
  },
  headerSection: {
    marginBottom: 16,
  },
  scannerBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 12,
  },
  scannerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  introCard: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  introText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  previewBoxContainer: {
    width: "100%",
    height: CANVAS_SIZE,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    marginBottom: 20,
  },
  emptyPreviewState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  centerCameraCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
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
    backgroundColor: "rgba(0, 0, 0, 0.65)",
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
    gap: 12,
    marginBottom: 14,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  processModelButton: {
    height: 52,
    backgroundColor: "#963E00",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  processModelButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  clearButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* ---------------- Modal Result Styles ---------------- */
  resultModalRoot: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  resultModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    padding: 6,
  },
  moreButton: {
    padding: 6,
  },
  resultModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4A2810",
  },
  resultModalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultImageCard: {
    height: 220,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    marginVertical: 12,
  },
  resultImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  matchBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#963E00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  matchBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  dishHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  detectedTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#963E00",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  dishTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
  },
  nutritionFactsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
  energyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5EBE1",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  energyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#963E00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  energyTextGroup: {
    flex: 1,
  },
  energyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B5A4E",
  },
  energyValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
  },
  macroBarBg: {
    height: 4,
    backgroundColor: "#EEF2F6",
    borderRadius: 2,
    overflow: "hidden",
  },
  macroBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  addToLogButton: {
    flexDirection: "row",
    height: 52,
    backgroundColor: "#E06D14",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#E06D14",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToLogButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});

export default ScannerScreen;
