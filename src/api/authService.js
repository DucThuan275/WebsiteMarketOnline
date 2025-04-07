import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axiosConfig";

const authService = {
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        "/auth/authenticate",
        credentials
      );
      console.log("✅ Login response:", response);
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
      throw error;
    }
  },

  decodeToken: (token) => {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      throw new Error("Token không hợp lệ");
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/admin/login";
  },

  isAdmin: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return false;

      const decoded = jwtDecode(token);
      return decoded.role === "ADMIN";
    } catch (error) {
      return false;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  getUserData: () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return null;

      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  },
};

export default authService;
