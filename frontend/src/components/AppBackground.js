import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const AppBackground = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.leftGlow} />
      <View style={styles.bottomGlow} />
      <View style={styles.centerWash} />
      <View style={styles.edgeFrame} />

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3ED",
    position: "relative",
  },
  topGlow: {
    position: "absolute",
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: width,
    top: -width * 0.24,
    right: -width * 0.22,
     backgroundColor: "rgba(201, 124, 93, 0.30)",
  },
  leftGlow: {
    position: "absolute",
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width,
    left: -width * 0.26,
    top: height * 0.18,
     backgroundColor: "rgba(66, 153, 225, 0.22)",
  },
  bottomGlow: {
    position: "absolute",
    width: width * 0.92,
    height: width * 0.92,
    borderRadius: width,
    bottom: -width * 0.38,
    left: width * 0.04,
     backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  centerWash: {
    ...StyleSheet.absoluteFillObject,
     backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  edgeFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default AppBackground;
