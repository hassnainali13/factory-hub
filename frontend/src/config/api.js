// frontend\src\config\api.js
const API_BASE = import.meta.env.VITE_API_URL;

// Safety check
if (!API_BASE) {
  throw new Error(
    "❌ VITE_API_URL is not defined. Please check your .env file."
  );
}

// Remove trailing slash if exists
const cleanBaseURL = API_BASE.replace(/\/+$/, "");

// Helper to build URLs safely
export const buildApiUrl = (path = "") => {
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBaseURL}/${cleanPath}`;
};

export { cleanBaseURL as API_BASE };
