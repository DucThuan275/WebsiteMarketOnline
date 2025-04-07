import axios from "axios";
import { UrlAPI } from "../configURL";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8088/api/v1", // Make sure this is correct
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gửi token trong mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi 401 và tự động refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${UrlAPI}/auth/refresh-token`, {
            token: refreshToken,
          });
          const newToken = res.data.access_token;
          localStorage.setItem("authToken", newToken);

          // Gửi lại request ban đầu với token mới
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(error.config);
        } catch (refreshError) {
          console.error("🔴 Refresh token thất bại", refreshError);
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/authenticate";
        }
      } else {
        console.warn("⚠️ Không có refresh token, yêu cầu đăng nhập lại");
        window.location.href = "/authenticate";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
