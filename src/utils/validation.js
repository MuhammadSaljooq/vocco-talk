/**
 * Form validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {{valid: boolean, error?: string}}
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {{strength: string, score: number, feedback: string[]}}
 */
export function checkPasswordStrength(password) {
  if (!password) {
    return { strength: 'weak', score: 0, feedback: [] };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  // Determine strength
  let strength = 'weak';
  if (score >= 5) {
    strength = 'very-strong';
  } else if (score >= 4) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return { strength, score, feedback };
}

/**
 * Validate password
 * @param {string} password - Password
 * @param {number} minLength - Minimum length (default: 8)
 * @returns {{valid: boolean, error?: string}}
 */
export function validatePassword(password, minLength = 8) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }

  const strength = checkPasswordStrength(password);
  if (strength.score < 3) {
    return { valid: false, error: 'Password is too weak. Please use a stronger password.' };
  }

  return { valid: true };
}

/**
 * Validate name
 * @param {string} name - Full name
 * @returns {{valid: boolean, error?: string}}
 */
export function validateName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }

  return { valid: true };
}

/**
 * Validate password match
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirmation password
 * @returns {{valid: boolean, error?: string}}
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }

  return { valid: true };
}

/**
 * Validate all signup fields
 * @param {Object} formData - { name, email, password, confirmPassword }
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateSignupForm(formData) {
  const errors = {};

  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error;
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }

  // Validate password match
  const matchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
  if (!matchValidation.valid) {
    errors.confirmPassword = matchValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login form
 * @param {Object} formData - { email, password }
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateLoginForm(formData) {
  const errors = {};

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }

  // Validate password (just check if exists)
  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}



