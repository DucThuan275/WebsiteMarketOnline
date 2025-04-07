"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import userLoginService from "../../api/userLoginService";

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function UserVerify({
  type,
  switchView,
  setSharedFormData,
  sharedFormData,
  setSharedError,
  setSharedSuccess,
  sharedError,
  sharedSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSharedFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (sharedError) setSharedError("");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSharedError("");

    try {
      const response = await userLoginService.verifyOtp({
        email: sharedFormData.email,
        otp: sharedFormData.otp,
      });

      // Check if the response has code 200 (success)
      if (response.code === "200" || response.data?.code === "200") {
        setSharedSuccess("OTP verification successful! Redirecting...");

        // Store tokens if they exist in the response
        const tokens = response.data || response;
        if (tokens.access_token) {
          localStorage.setItem("access_token", tokens.access_token);
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }

        // Redirect to dashboard or home page after successful verification
        setTimeout(() => {
          window.location.href = "/trang-chu";
        }, 1500);
      } else {
        setSharedError(
          response.message ||
            response.data?.message ||
            "Invalid OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setSharedError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSharedError("");

    try {
      await userLoginService.verifyAccount({
        email: sharedFormData.email,
        otp: sharedFormData.otp,
      });

      setSharedSuccess("Account verification successful! You can now login.");
      // Clear form and switch to login view
      setSharedFormData({
        ...sharedFormData,
        otp: "",
      });
      setTimeout(() => {
        switchView("login");
      }, 2000);
    } catch (error) {
      setSharedError(
        error.response?.data?.message ||
          "Account verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setSharedError("");

    try {
      await userLoginService.sendOtp(sharedFormData.email);
      setSharedSuccess("OTP sent successfully");
    } catch (error) {
      setSharedError(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isVerifyOtp = type === "verifyOtp";
  const title = isVerifyOtp
    ? "Two-Factor Authentication"
    : "Verify Your Account";
  const handleSubmit = isVerifyOtp ? handleVerifyOtp : handleVerifyAccount;

  return (
    <>
      <div className="text-center">
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isVerifyOtp ? "Xác Thực Hai Yếu Tố" : "Xác Thực Tài Khoản"}
        </motion.h2>
        <motion.p
          className="text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isVerifyOtp
            ? "Nhập mã xác thực đã được gửi đến email của bạn"
            : "Xác thực email để kích hoạt tài khoản của bạn"}
        </motion.p>
      </div>

      {/* Error and Success Messages */}
      {sharedError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-600">{sharedError}</p>
        </div>
      )}

      {sharedSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-green-600">{sharedSuccess}</p>
        </div>
      )}

      <motion.form
        className="space-y-5"
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <label
            htmlFor="verify-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Địa Chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <input
              id="verify-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
              value={sharedFormData.email}
              onChange={handleChange}
              readOnly={sharedFormData.email !== ""}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label
            htmlFor="verify-otp"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mã Xác Thực
          </label>
          <input
            id="verify-otp"
            name="otp"
            type="text"
            required
            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Nhập mã xác thực"
            value={sharedFormData.otp}
            onChange={handleChange}
          />
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Đang xác thực...
            </>
          ) : (
            <>
              {isVerifyOtp ? "Xác Thực & Tiếp Tục" : "Xác Thực Tài Khoản"}
              {isVerifyOtp && <ArrowRight className="ml-2 h-5 w-5" />}
            </>
          )}
        </motion.button>

        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center mt-4"
        >
          <button
            type="button"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => switchView("login")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại đăng nhập
          </button>

          <button
            type="button"
            onClick={resendOtp}
            disabled={loading}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Gửi lại mã
          </button>
        </motion.div>
      </motion.form>
    </>
  );
}
