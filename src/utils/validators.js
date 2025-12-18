/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone format
 */
export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

/**
 * Validate required field
 */
export const validateRequired = (value) => {
  return value && value.toString().trim() !== '';
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, length) => {
  return value && value.toString().length >= length;
};
