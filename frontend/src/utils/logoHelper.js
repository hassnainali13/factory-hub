import defaultworkspace from "../assets/default-workspace.png";
import { buildApiUrl } from "../config/api";

/**
 * Returns the proper logo URL for a workspace.
 * @param {string|null} logoPath - The workspace logo path from backend.
 * @returns {string} - Full URL or default logo.
 */
export const getWorkspaceLogo = (logoPath) => {
  if (!logoPath) return defaultworkspace;

  try {
    // Clean Windows backslashes
    const cleanPath = logoPath.replace(/\\/g, "/");

    // Build full URL
    return buildApiUrl(cleanPath);
  } catch (err) {
    console.error("Error building workspace logo URL:", err);
    return defaultworkspace;
  }
};
