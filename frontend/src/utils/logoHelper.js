import defaultworkspace from "../assets/default-workspace.png";

/**
 * Returns the proper logo URL for a workspace.
 * @param {string|null} logoPath - The workspace logo path from backend.
 * @returns {string} - Full URL or default logo.
 */
export const getWorkspaceLogo = (logoPath) => {
  if (!logoPath) return defaultworkspace;

  try {
    const cleanPath = logoPath.replace(/\\/g, "/");

    // ✅ If the path already starts with http, it's a Cloudinary URL
    if (cleanPath.startsWith("http")) return cleanPath;

    // Otherwise, assume it's a relative backend path
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  } catch (err) {
    console.error("Error building workspace logo URL:", err);
    return defaultworkspace;
  }
};