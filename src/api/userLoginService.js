import axiosInstance from "./axiosConfig";

const userLoginService = {
  // Registration
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data.data;
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  },

  // Login with email and password
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        "/auth/authenticate",
        credentials
      );
      console.log("✅ Login response:", response);

      // Check if 2FA is required
      if (response.data?.data?.requireTwoFactor) {
        return {
          requireTwoFactor: true,
          email: credentials.email,
          message: response.data.message,
        };
      }

      // Store tokens if authentication successful
      if (response.data?.data?.access_token) {
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("refreshToken", response.data.data.refresh_token);

        // Save user data if available
        if (response.data.data.user) {
          localStorage.setItem(
            "userData",
            JSON.stringify(response.data.data.user)
          );
        }

        console.log("✅ Token saved:", localStorage.getItem("authToken"));
        return response.data.data;
      } else {
        console.error("❌ Invalid data structure:", response.data);
        throw new Error("Token not received");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },

  // Verify OTP for two-factor authentication
  verifyOtp: async (otpData) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", otpData);

      // If OTP verification successful, store tokens
      if (response.data?.data?.access_token) {
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("refreshToken", response.data.data.refresh_token);

        if (response.data.data.user) {
          localStorage.setItem(
            "userData",
            JSON.stringify(response.data.data.user)
          );
        }
      }

      return response.data;
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      throw error;
    }
  },

  // Verify account with OTP
  verifyAccount: async (verificationData) => {
    try {
      const response = await axiosInstance.post(
        "/auth/verify-account",
        verificationData
      );
      return response.data;
    } catch (error) {
      console.error("❌ Account verification error:", error);
      throw error;
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Forgot password error:", error);
      throw error;
    }
  },

  // Reset password with OTP
  resetPasswordWithOtp: async (resetData) => {
    try {
      const response = await axiosInstance.post(
        "/auth/reset-password-with-otp",
        resetData
      );
      return response.data;
    } catch (error) {
      console.error("❌ Password reset error:", error);
      throw error;
    }
  },

  // Send OTP to email
  sendOtp: async (email) => {
    try {
      const response = await axiosInstance.post("/auth/send-otp", { email });
      return response.data;
    } catch (error) {
      console.error("❌ Send OTP error:", error);
      throw error;
    }
  },

  // Enable two-factor authentication
  enableTwoFactor: async (email) => {
    try {
      const response = await axiosInstance.post("/auth/enable-2fa", { email });
      return response.data;
    } catch (error) {
      console.error("❌ Enable 2FA error:", error);
      throw error;
    }
  },

  // Disable two-factor authentication
  disableTwoFactor: async (email) => {
    try {
      const response = await axiosInstance.post("/auth/disable-2fa", { email });
      return response.data;
    } catch (error) {
      console.error("❌ Disable 2FA error:", error);
      throw error;
    }
  },

  // Activate account with token (from email link)
  activateAccount: async (token) => {
    try {
      const response = await axiosInstance.get(`/auth/activate?token=${token}`);
      return response.data;
    } catch (error) {
      console.error("❌ Account activation error:", error);
      throw error;
    }
  },

  // Social login (Google, Facebook, etc.)
  socialLogin: async (socialData) => {
    try {
      const response = await axiosInstance.post(
        "/auth/social-login",
        socialData
      );

      if (response.data?.data?.access_token) {
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("refreshToken", response.data.data.refresh_token);

        if (response.data.data.user) {
          localStorage.setItem(
            "userData",
            JSON.stringify(response.data.data.user)
          );
        }
      }

      return response.data.data;
    } catch (error) {
      console.error("❌ Social login error:", error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axiosInstance.post("/auth/refresh-token", {
        token: refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    window.location.href = "/";
  },

  // Get current user data from localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },
};

export default userLoginService;
