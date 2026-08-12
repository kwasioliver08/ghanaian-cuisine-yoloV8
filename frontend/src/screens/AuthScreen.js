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
  Image,
  ImageBackground,
} from "react-native";
import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "../utils/validation";
import { Feather } from "@expo/vector-icons";
import { api } from "../utils/api";

const AuthScreen = ({ onAuthSuccess, showNotification }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password visibility toggle states
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
    if (!agreeTerms)
      newErrors.agreeTerms = "You must agree to the Terms and Conditions";

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
    setLoading(true);
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

        onboardingDetails: {
          gender: response.user.gender,
          age: response.user.age,
          weight: response.user.weight,
          height: response.user.height,
        },

        dailyTargets: {
          calories: response.user.calories,
          carbs: response.user.carbs,
          protein: response.user.protein,
          fats: response.user.fats,
        },
      };

      if (onAuthSuccess) onAuthSuccess(userPayload);
    } catch (error) {
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
        <View style={styles.screenBody}>
          {/* Top Badge Icon (Switches dynamically between Sign In and Sign Up) */}
          <View style={styles.badgeContainer}>
            <Image
              source={
                isSignUp
                  ? require("../../assets/create_account_icon.png")
                  : require("../../assets/sign_in.png")
              }
              style={styles.badgeImage}
            />
          </View>

          {/* Header Section */}
          <Text style={styles.headerTitle}>
            {isSignUp ? "Create Account" : "Akwaaba"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isSignUp
              ? "Join our community and track your local meals effortlessly."
              : "Your Ghanaian Cuisine"}
          </Text>

          {/* Hero Banner Image */}
          <View style={styles.bannerContainer}>
            {isSignUp ? (
              <Image
                source={require("../../assets/create_account_banner.png")}
                style={styles.bannerImagePlain}
                resizeMode="cover"
              />
            ) : (
              <ImageBackground
                source={require("../../assets/sign_in_banner.jpg")}
                style={styles.bannerImageBg}
                imageStyle={{ borderRadius: 16 }}
              >
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerOverlayText}>
                    Discover the health in your heritage
                  </Text>
                </View>
              </ImageBackground>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name (Sign Up only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.fullName && styles.inputError,
                  ]}
                >
                  <Feather
                    name="user"
                    size={18}
                    color="#8C857B"
                    style={styles.leftInputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Kofi Mensah"
                    placeholderTextColor="#8C857B"
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
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[styles.inputWrapper, errors.email && styles.inputError]}
              >
                <Feather
                  name="mail"
                  size={18}
                  color="#8C857B"
                  style={styles.leftInputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={
                    isSignUp ? "kofi.mensah@example.gh" : "kofi@example.com"
                  }
                  placeholderTextColor="#8C857B"
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
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputError,
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color="#8C857B"
                  style={styles.leftInputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#8C857B"
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
                    color="#8C857B"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <Feather
                    name="rotate-ccw"
                    size={18}
                    color="#8C857B"
                    style={styles.leftInputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#8C857B"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: null });
                    }}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            )}

            {/* Terms and Conditions Checkbox (Sign Up only) */}
            {isSignUp && (
              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    agreeTerms && styles.checkboxChecked,
                  ]}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  activeOpacity={0.7}
                >
                  {agreeTerms && (
                    <Feather name="check" size={12} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms and Conditions</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </View>
            )}

            {/* Forgot Password Link (Sign In only) */}
            {!isSignUp && (
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Main Action Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? "Loading..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </Text>
              {!loading && (
                <Feather
                  name="arrow-right"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>

            {/* Toggle Sign In / Sign Up Link */}
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
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 36,
    justifyContent: "center",
  },
  screenBody: {
    width: "100%",
    alignItems: "center",
  },
  badgeContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  badgeImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 18,
  },
  bannerContainer: {
    height: 140,
    width: "100%",
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerImagePlain: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  bannerImageBg: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bannerOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bannerOverlayText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
  },
  leftInputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  eyeIconButton: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    fontWeight: "500",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#963E00",
    borderColor: "#963E00",
  },
  termsText: {
    fontSize: 12,
    color: "#475569",
    flex: 1,
    lineHeight: 16,
  },
  termsLink: {
    color: "#963E00",
    fontWeight: "700",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#963E00",
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#963E00",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#963E00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  toggleLink: {
    fontSize: 13,
    color: "#963E00",
    fontWeight: "700",
  },
});

export default AuthScreen;
