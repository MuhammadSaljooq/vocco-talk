/**
 * Rate limiting for authentication attempts
 * Prevents brute force attacks
 */

const RATE_LIMIT_STORAGE_KEY = 'vocco_talk_auth_rate_limits';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_SIGNUP_ATTEMPTS = 3;
const SIGNUP_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Get rate limit data
 */
function getRateLimitData() {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading rate limit data:', error);
    return {};
  }
}

/**
 * Save rate limit data
 */
function saveRateLimitData(data) {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

/**
 * Check if login is rate limited
 * @param {string} email - User email
 * @returns {{allowed: boolean, remainingAttempts: number, lockoutUntil?: Date, message?: string}}
 */
export function checkLoginRateLimit(email) {
  const data = getRateLimitData();
  const now = Date.now();
  const emailKey = `login_${email.toLowerCase()}`;
  const attempts = data[emailKey] || { count: 0, lastAttempt: 0, lockoutUntil: 0 };

  // Check if account is locked out
  if (attempts.lockoutUntil && now < attempts.lockoutUntil) {
    const lockoutMinutes = Math.ceil((attempts.lockoutUntil - now) / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutUntil: new Date(attempts.lockoutUntil),
      message: `Too many failed login attempts. Please try again in ${lockoutMinutes} minute(s).`
    };
  }

  // Reset if lockout period has passed
  if (attempts.lockoutUntil && now >= attempts.lockoutUntil) {
    attempts.count = 0;
    attempts.lockoutUntil = 0;
  }

  // Check if max attempts reached
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockoutUntil = now + LOCKOUT_DURATION;
    data[emailKey] = attempts;
    saveRateLimitData(data);
    
    const lockoutMinutes = Math.ceil(LOCKOUT_DURATION / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutUntil: new Date(attempts.lockoutUntil),
      message: `Too many failed login attempts. Account locked for ${lockoutMinutes} minutes.`
    };
  }

  const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts.count;
  return {
    allowed: true,
    remainingAttempts,
    lockoutUntil: attempts.lockoutUntil ? new Date(attempts.lockoutUntil) : null
  };
}

/**
 * Record failed login attempt
 * @param {string} email - User email
 */
export function recordFailedLoginAttempt(email) {
  const data = getRateLimitData();
  const now = Date.now();
  const emailKey = `login_${email.toLowerCase()}`;
  const attempts = data[emailKey] || { count: 0, lastAttempt: 0, lockoutUntil: 0 };

  // Reset count if last attempt was more than 1 hour ago
  if (now - attempts.lastAttempt > 60 * 60 * 1000) {
    attempts.count = 0;
  }

  attempts.count += 1;
  attempts.lastAttempt = now;

  // Lock account if max attempts reached
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockoutUntil = now + LOCKOUT_DURATION;
  }

  data[emailKey] = attempts;
  saveRateLimitData(data);
}

/**
 * Reset login attempts (on successful login)
 * @param {string} email - User email
 */
export function resetLoginAttempts(email) {
  const data = getRateLimitData();
  const emailKey = `login_${email.toLowerCase()}`;
  delete data[emailKey];
  saveRateLimitData(data);
}

/**
 * Check if signup is rate limited
 * @param {string} ip - IP address (or identifier)
 * @returns {{allowed: boolean, remainingAttempts: number, message?: string}}
 */
export function checkSignupRateLimit(ip = 'default') {
  const data = getRateLimitData();
  const now = Date.now();
  const ipKey = `signup_${ip}`;
  const attempts = data[ipKey] || { count: 0, firstAttempt: now };

  // Reset if window has passed
  if (now - attempts.firstAttempt > SIGNUP_WINDOW) {
    attempts.count = 0;
    attempts.firstAttempt = now;
  }

  if (attempts.count >= MAX_SIGNUP_ATTEMPTS) {
    const minutesRemaining = Math.ceil((SIGNUP_WINDOW - (now - attempts.firstAttempt)) / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      message: `Too many signup attempts. Please try again in ${minutesRemaining} minute(s).`
    };
  }

  const remainingAttempts = MAX_SIGNUP_ATTEMPTS - attempts.count;
  return {
    allowed: true,
    remainingAttempts
  };
}

/**
 * Record signup attempt
 * @param {string} ip - IP address (or identifier)
 */
export function recordSignupAttempt(ip = 'default') {
  const data = getRateLimitData();
  const now = Date.now();
  const ipKey = `signup_${ip}`;
  const attempts = data[ipKey] || { count: 0, firstAttempt: now };

  // Reset if window has passed
  if (now - attempts.firstAttempt > SIGNUP_WINDOW) {
    attempts.count = 0;
    attempts.firstAttempt = now;
  }

  attempts.count += 1;
  data[ipKey] = attempts;
  saveRateLimitData(data);
}




