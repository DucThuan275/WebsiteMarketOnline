"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
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

export default function UserLogin({
  switchView,
  setSharedFormData,
  sharedFormData,
  setSharedError,
  setSharedSuccess,
  sharedError,
  sharedSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSharedFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (sharedError) setSharedError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSharedError("");

    try {
      const response = await userLoginService.login({
        email: sharedFormData.email,
        password: sharedFormData.password,
      });

      if (response.requireTwoFactor) {
        switchView("verifyOtp");
        setSharedSuccess("Please enter the OTP sent to your email");
      } else {
        setSharedSuccess("Login successful! Redirecting...");
        // Redirect to dashboard or home page after successful login
        setTimeout(() => {
          window.location.href = "/trang-chu";
        }, 1500);
      }
    } catch (error) {
      setSharedError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setSharedError("");

    try {
      // In a real implementation, you would handle the OAuth flow
      // This is a simplified example
      const socialData = {
        provider,
        token: "sample-token", // This would come from the OAuth provider
      };

      await userLoginService.socialLogin(socialData);
      setSharedSuccess(`${provider} login successful! Redirecting...`);
      // Redirect to dashboard or home page after successful login
      setTimeout(() => {
        window.location.href = "/trang-chu";
      }, 1500);
    } catch (error) {
      setSharedError(
        error.response?.data?.message ||
          `${provider} login failed. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Đăng Nhập
        </motion.h2>
        <motion.p
          className="text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Truy cập bảng điều khiển tài khoản công nghệ của bạn
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
        onSubmit={handleLogin}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Địa Chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="email@example.com"
              value={sharedFormData.email}
              onChange={handleChange}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật Khẩu
            </label>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => {
                switchView("forgotPassword");
                setSharedError("");
                setSharedSuccess("");
              }}
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-blue-500" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              value={sharedFormData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Ghi nhớ đăng nhập
          </label>
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
              Đang đăng nhập...
            </>
          ) : (
            "Đăng Nhập"
          )}
        </motion.button>

        <motion.div variants={itemVariants} className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <motion.button
              variants={itemVariants}
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.701-6.735-2.701-5.539 0-10.032 4.493-10.032 10.032s4.493 10.032 10.032 10.032c8.305 0 10.032-7.731 10.032-13.032 0-0.843-0.076-1.646-0.228-2.429h-9.804z" />
              </svg>
              Google
            </motion.button>

            <motion.button
              variants={itemVariants}
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
              </svg>
              Facebook
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => {
                switchView("register");
                setSharedError("");
                setSharedSuccess("");
              }}
            >
              Đăng ký ngay
            </button>
          </p>
        </motion.div>
      </motion.form>
    </>
  );
}
