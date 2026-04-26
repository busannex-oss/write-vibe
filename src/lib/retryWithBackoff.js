/**
 * Retry logic with exponential backoff for handling 504 and transient errors
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Max retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Promise} Result from successful fn call
 */
export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is504 = error?.response?.status === 504 || error?.message?.includes('504');
      const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
      const isTransient = is504 || isTimeout || error?.response?.status >= 500;
      const isLastAttempt = attempt === maxRetries - 1;

      if (!isTransient || isLastAttempt) throw error;

      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};