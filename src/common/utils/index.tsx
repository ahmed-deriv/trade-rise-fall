import { authStore } from "../../stores/AuthStore";

/**
 * Check if code is running in a browser environment
 * @returns {boolean} True if running in browser, false otherwise
 */
export const isBrowser = (): boolean => typeof window !== "undefined";

/**
 * Gets the base URL path considering the current location pathname
 * @param path - Optional path to append to the base URL
 * @returns The complete URL path
 */

export const isLogged = (): boolean => {
  return authStore.isAuthenticated;
};

export const getUrlBase = (path: string = ""): string => {
  const l = window.location;

  // Check if pathname starts with /br_ pattern
  if (!/^\/(br_)/.test(l.pathname)) return path;

  // Extract the first path segment and combine with provided path
  const baseSegment = l.pathname.split("/")[1];
  const normalizedPath = /^\//.test(path) ? path : `/${path}`;

  return `/${baseSegment}${normalizedPath}`;
};
