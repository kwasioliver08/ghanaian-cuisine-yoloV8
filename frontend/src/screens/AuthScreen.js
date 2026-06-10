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
  Alert,
} from "react-native";
import {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "../utils/validation";

/**
 * AuthScreen Component
 * Handles user authentication with Sign In and Sign Up workflows
 * Enforces strict input validation and passes authenticated user data to App.js
 */
const AuthScreen = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Validate Sign Up form
   */
  const validateSignUp = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email (must contain @)";
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      newErrors.confirmPassword = "Passwords must match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate Sign In form
   */
  const validateSignIn = () => {
    const newErrors = {};

    if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (password.length < 6) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle Sign Up submission
   */
  const handleSignUp = async () => {
    if (!validateSignUp()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: "user_" + Date.now(),
        fullName: fullName.trim(),
        email: email.trim(),
        token: "mock_token_" + Math.random().toString(36).substr(2, 9),
        isNewUser: true,
        createdAt: new Date().toISOString(),
      };

      if (onAuthSuccess) {
        onAuthSuccess(mockUser);
      }
    } catch (error) {
      Alert.alert(
        "Sign Up Error",
        error.message || "An error occurred during sign up",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Sign In submission
   */
  const handleSignIn = async () => {
    if (!validateSignIn()) return;

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: "user_" + Date.now(),
        fullName: "Mock User",
        email: email.trim(),
        token: "mock_token_" + Math.random().toString(36).substr(2, 9),
        isNewUser: false,
        createdAt: new Date().toISOString(),
      };

      if (onAuthSuccess) {
        onAuthSuccess(mockUser);
      }
    } catch (error) {
      Alert.alert(
        "Sign In Error",
        error.message || "An error occurred during sign in",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleSignUp : handleSignIn;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Ghanaian Cuisine</Text>
          <Text style={styles.headerSubtitle}>
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </Text>
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
                    if (errors.fullName) {
                      setErrors({ ...errors, fullName: null });
                    }
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
                  if (errors.email) {
                    setErrors({ ...errors, email: null });
                  }
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
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor="#A0AEC0"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: null });
                  }
                }}
                secureTextEntry
                editable={!loading}
              />
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
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#A0AEC0"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: null });
                    }
                  }}
                  secureTextEntry
                  editable={!loading}
                />
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
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
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
              }}
              disabled={loading}
            >
              <Text style={styles.toggleLink}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 60, // Gives structural padding when keyboard rises
    justifyContent: "center", // Centers form elements beautifully
  },
  headerSection: {
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#4A5568",
    fontWeight: "500",
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#2D3748",
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
    borderRadius: 8,
    backgroundColor: "#2D3748",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
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
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "400",
  },
  toggleLink: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "700",
  },
});

export default AuthScreen;
