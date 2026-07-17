import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const NotificationToast = ({ visible, message, type, onClose }) => {
  if (!visible) return null;

  // Dynamic iconography & styling based on the notice category
  const isError = type === "error";
  const iconName = isError
    ? "alert-circle"
    : type === "info"
      ? "info"
      : "check-circle";
  const accentColor = isError
    ? "#EF4444"
    : type === "info"
      ? "#3B82F6"
      : "#10B981";

  return (
    <View style={[styles.toastWrapper, { borderLeftColor: accentColor }]}>
      <View style={styles.contentRow}>
        <Feather name={iconName} size={18} color={accentColor} />
        <Text style={styles.messageText} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 44, // Perfectly aligns right under the safe status bar region
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999, // Floating master layer priority stack
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 18,
  },
  closeButton: {
    padding: 2,
  },
});

export default NotificationToast;
