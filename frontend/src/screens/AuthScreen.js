import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "../utils/validation";
// --- IMPORT EXPO VECTOR ICONS FOR THE EYE ---
import { Feather } from "@expo/vector-icons";
// --- IMPORT THE LIVE API HELPER ---
import { api } from "../utils/api";

const AuthScreen = ({ onAuthSuccess, showNotification }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- PASSWORD VISIBILITY TOGGLE STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateSignUp = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!isValidEmail(email))
      newErrors.email = "Please enter a valid email (must contain @)";
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid)
      newErrors.password = passwordValidation.message;
    if (!passwordsMatch(password, confirmPassword))
      newErrors.confirmPassword = "Passwords must match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignIn = () => {
    const newErrors = {};
    if (!isValidEmail(email)) newErrors.email = "Please enter a valid email";
    if (password.length < 6) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateSignUp()) return;
    loading(true);
    try {
      const response = await api.register(
        fullName.trim(),
        email.trim(),
        password,
      );

      const userPayload = {
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        token: response.token,
        isNewUser: true,
      };

      if (onAuthSuccess) onAuthSuccess(userPayload);
    } catch (error) {
      // 🔑 FIXED: Custom cross-platform global notification toast replacement
      if (showNotification) {
        showNotification(
          error.message || "An error occurred during sign up",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateSignIn()) return;
    setLoading(true);
    try {
      const response = await api.login(email.trim(), password);

      const userPayload = {
        id: response.user.id,
        fullName: response.user.full_name,
        email: response.user.email,
        token: response.token,
        isNewUser: false,
      };

      if (onAuthSuccess) onAuthSuccess(userPayload);
    } catch (error) {
      // 🔑 FIXED: Custom cross-platform global notification toast replacement
      if (showNotification) {
        showNotification(
          error.message || "An error occurred during sign in",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleSignIn;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authCard}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>SCAN + TRACK</Text>
            </View>
            <Text style={styles.headerTitle}>Ghanaian Cuisine</Text>
            <Text style={styles.headerSubtitle}>
              {isSignUp
                ? "Create your account to unlock meal scanning and daily targets."
                : "Sign in to continue tracking meals and nutrition."}
            </Text>
            <View style={styles.featureRow}>
              <View style={styles.featureChip}>
                <Text style={styles.featureChipText}>Meal scan</Text>
              </View>
              <View style={styles.featureChip}>
                <Text style={styles.featureChipText}>Macro goals</Text>
              </View>
              <View style={styles.featureChip}>
                <Text style={styles.featureChipText}>Daily log</Text>
              </View>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Full Name Field (Sign Up only) */}
            {isSignUp && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A0AEC0"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName)
                        setErrors({ ...errors, fullName: null });
                    }}
                    editable={!loading}
                  />
                </View>
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </>
            )}

            {/* Email Field */}
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </>

            {/* Password Field */}
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    errors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#A0AEC0"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password)
                        setErrors({ ...errors, password: null });
                    }}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIconButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.6}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={18}
                      color="#718096"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </>

            {/* Confirm Password Field (Sign Up only) */}
            {isSignUp && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View
                    style={[
                      styles.passwordWrapper,
                      errors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm your password"
                      placeholderTextColor="#A0AEC0"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword)
                          setErrors({ ...errors, confirmPassword: null });
                      }}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIconButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      activeOpacity={0.6}
                    >
                      <Feather
                        name={showConfirmPassword ? "eye" : "eye-off"}
                        size={18}
                        color="#718096"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? "Loading..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Toggle Sign In / Sign Up */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                disabled={loading}
              >
                <Text style={styles.toggleLink}>
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 32,
    justifyContent: "center",
  },
  authCard: {
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(219, 234, 254, 0.95)",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 6,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.08)",
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#0F172A",
  },
  headerTitle: {
    fontSize: 29,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 14,
  },
  featureChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  featureChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    fontSize: 15,
    color: "#1F2937",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
  },
  eyeIconButton: {
    height: "100%",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#F56565",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: 12,
    color: "#C53030",
    marginBottom: 12,
    marginTop: -4,
    fontWeight: "500",
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  toggleText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "400",
  },
  toggleLink: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
});

export default AuthScreen;
