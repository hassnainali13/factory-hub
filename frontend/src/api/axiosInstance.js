  // //frontend\src\api\axiosInstance.js
  // import axios from "axios";

  // const API_URL = import.meta.env.VITE_API_URL;

  // const axiosInstance = axios.create({
  //   baseURL: `${API_URL}/api`, // automatically hits backend /api routes
  //   headers: { "Content-Type": "application/json" },
  // });


  // axiosInstance.interceptors.request.use((config) => {
  //   const token = localStorage.getItem("token");

  //   // console.log("TOKEN FOUND:", token);

  //   if (token) {
  //     config.headers.Authorization = `Bearer ${token}`;
  //   }

  //   return config;
  // });

  // export default axiosInstance;


  import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`, // Automatically hits /api routes
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;