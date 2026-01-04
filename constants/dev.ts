/**
 * Development-only configuration flags
 * These should be set to false in production builds
 */

/**
 * When enabled, simulates iPhone-like safe area insets on web platform
 * for testing player layout behavior (top: 44, bottom: 34)
 *
 * Enable only temporarily while debugging web layout.
 * Gated behind __DEV__ so it cannot be enabled in production.
 * Default: false (safe for production)
 */
export const DEV_SIMULATE_IOS_INSETS = __DEV__ && false;

