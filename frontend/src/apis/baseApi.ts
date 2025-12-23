import axios from "axios";


// Create 1 shared axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  // change if needed
});

// Intercept all responses (success or error)
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Check the status code
      if (error.response?.status === 401) {
    const message = error.response?.data?.message || "";

    if (message.includes("JWT expired")) {
      localStorage.removeItem("access_token");

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }

      return Promise.reject(new Error("Vui lòng đăng nhập lại"));
    }

    

    // default 401
    localStorage.removeItem("access_token");

    if (window.location.pathname !== "/") {
      window.location.replace("/");
    }

    return Promise.reject(
      new Error("Bạn không có quyền truy cập tài nguyên này")
    );
  }
    

    return Promise.reject(error);
  }
);

export default api;
