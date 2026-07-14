import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";

const { width } = Dimensions.get("window");

const ProfileScreen = ({
  userProfile,
  dailyTargets,
  onboardingDetails,
  onLogout,
  onEditMacroAllocation,
  onClearScanIndexes,
}) => {
  // Graceful fallback defaults if the parent context state isn't populated yet
  const profile = userProfile || {
    fullName: "Kwakye Oliver Andoh",
    email: "kwasioliver08@gmail.com",
    joinedDate: "July 2026",
  };

  const joinedDate = profile.joinedDate || "July 2026";

  const targets = dailyTargets || {
    calories: 2150,
    carbs: 295,
    protein: 108,
    fats: 60,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Master Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{profile.fullName}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Premium Account</Text>
          </View>
        </View>

        <View style={styles.profileMetaRow}>
          <View style={styles.profileMetaChip}>
            <Text style={styles.profileMetaLabel}>Joined</Text>
            <Text style={styles.profileMetaValue}>{joinedDate}</Text>
          </View>
          <View style={styles.profileMetaChip}>
            <Text style={styles.profileMetaLabel}>Targets</Text>
            <Text style={styles.profileMetaValue}>4 macro goals</Text>
          </View>
        </View>
      </View>

      {/* 1b. Saved Personal Details */}
      <Text style={styles.sectionTitle}>Current Details</Text>
      <View style={styles.detailsGrid}>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Gender</Text>
          <Text style={styles.detailValue}>{onboardingDetails?.gender || "Not set"}</Text>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Age</Text>
          <Text style={styles.detailValue}>
            {onboardingDetails?.age ? `${onboardingDetails.age} years` : "Not set"}
          </Text>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>
            {onboardingDetails?.weight ? `${onboardingDetails.weight} kg` : "Not set"}
          </Text>
        </View>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Height</Text>
          <Text style={styles.detailValue}>
            {onboardingDetails?.height ? `${onboardingDetails.height} cm` : "Not set"}
          </Text>
        </View>
      </View>

      {/* 2. Nutritional Macro Targets Section */}
      <Text style={styles.sectionTitle}>Daily Metabolic Targets</Text>
      <View style={styles.macroGrid}>
        {/* Calories Card */}
        <View style={[styles.macroCard, { borderLeftColor: "#4A5568" }]}>
          <Text style={styles.macroLabel}>Energy Target</Text>
          <Text style={styles.macroValue}>
            {targets.calories} <Text style={styles.macroUnit}>kcal</Text>
          </Text>
        </View>

        {/* Protein Card */}
        <View style={[styles.macroCard, { borderLeftColor: "#3182CE" }]}>
          <Text style={styles.macroLabel}>Protein Target</Text>
          <Text style={styles.macroValue}>
            {targets.protein}
            <Text style={styles.macroUnit}>g</Text>
          </Text>
        </View>

        {/* Carbs Card */}
        <View style={[styles.macroCard, { borderLeftColor: "#DD6B20" }]}>
          <Text style={styles.macroLabel}>Carbohydrates</Text>
          <Text style={styles.macroValue}>
            {targets.carbs}
            <Text style={styles.macroUnit}>g</Text>
          </Text>
        </View>

        {/* Fats Card */}
        <View style={[styles.macroCard, { borderLeftColor: "#E53E3E" }]}>
          <Text style={styles.macroLabel}>Lipids / Fats</Text>
          <Text style={styles.macroValue}>
            {targets.fats}
            <Text style={styles.macroUnit}>g</Text>
          </Text>
        </View>
      </View>

      {/* 3. Account Actions System Menu */}
      <Text style={styles.sectionTitle}>Workspace Settings</Text>
      <View style={styles.settingsMenu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (onEditMacroAllocation) {
              onEditMacroAllocation();
              return;
            }

            Alert.alert("Edit Macro Allocation", "This action is not available right now.");
          }}
        >
          <Text style={styles.menuItemText}>Edit Macro Allocation Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            if (onClearScanIndexes) {
              onClearScanIndexes();
              Alert.alert("Scan Indexes Cleared", "Scanner state has been reset.");
              return;
            }

            Alert.alert("Clear Local Scan Indexes", "This action is not available right now.");
          }}
        >
          <Text style={styles.menuItemText}>Clear Local Scan Indexes</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>Sign Out of Application</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerBranding}>
        Ghanaian Cuisine Local Food Analyzer v1.0.0
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  userName: {
    fontSize: 23,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  profileMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    width: "100%",
  },
  profileMetaChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F8F6F2",
    borderWidth: 1,
    borderColor: "#E7E0D8",
  },
  profileMetaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  profileMetaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  detailCard: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#F8F6F2",
    borderWidth: 1,
    borderColor: "#E7E0D8",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 28,
  },
  macroCard: {
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2, // Perfect mathematical scaling for 2-column grids on any device width
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  macroValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  settingsMenu: {
    backgroundColor: "rgba(255, 251, 247, 0.96)",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(231, 224, 216, 0.95)",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  menuArrow: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  logoutItem: {
    borderBottomWidth: 0,
    backgroundColor: "#FFF6F5",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B4534B",
    textAlign: "center",
  },
  footerBranding: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 10,
  },
});

export default ProfileScreen;
