/**
 * Format date to ISO string
 */
const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Calculate time remaining in milliseconds
 */
const getTimeRemaining = (expirationTime) => {
  const now = new Date();
  const expiration = new Date(expirationTime);
  const remaining = expiration - now;
  return remaining > 0 ? remaining : 0;
};

/**
 * Calculate time remaining in a readable format
 */
const getFormattedTimeRemaining = (expirationTime) => {
  const remaining = getTimeRemaining(expirationTime);
  
  if (remaining === 0) {
    return 'Expired';
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
};

/**
 * Check if time has expired
 */
const isExpired = (expirationTime) => {
  return new Date() > new Date(expirationTime);
};

/**
 * Add minutes to current time
 */
const addMinutesToNow = (minutes) => {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000);
};

/**
 * Calculate percentage
 */
const calculatePercentage = (earned, total) => {
  if (total === 0) return 0;
  return parseFloat(((earned / total) * 100).toFixed(2));
};

/**
 * Validate array of integers
 */
const validateIntArray = (arr) => {
  return Array.isArray(arr) && arr.every(item => Number.isInteger(item));
};

module.exports = {
  formatDate,
  getTimeRemaining,
  getFormattedTimeRemaining,
  isExpired,
  addMinutesToNow,
  calculatePercentage,
  validateIntArray
};
