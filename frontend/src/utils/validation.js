/**
 * Validation Utilities for Auth and Input
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  return email.includes("@") && email.length > 5;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} {isValid, message}
 */
export const isValidPassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters",
    };
  }
  return { isValid: true, message: "Password is valid" };
};

/**
 * Validate that passwords match
 * @param {string} password - First password
 * @param {string} confirmPassword - Confirmation password
 * @returns {boolean} True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};

/**
 * Validate numeric input (age, weight, height)
 * @param {string} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if valid
 */
export const isValidNumericInput = (value, min, max) => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max;
};
