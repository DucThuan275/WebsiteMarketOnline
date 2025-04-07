"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

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
}

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
}

export default function UserForgotPassword({
  switchView,
  setSharedFormData,
  sharedFormData,
  setSharedError,
  setSharedSuccess,
  sharedError,
  sharedSuccess,
  currentView,
}) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(currentView === "resetPassword" ? "reset" : "request")

  const handleChange = (e) => {
    const { name, value } = e.target
    setSharedFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (sharedError) setSharedError("")
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSharedError("")

    try {
      await userLoginService.forgotPassword(sharedFormData.email)
      setSharedSuccess("If your email exists in our system, you will receive a password reset code.")
      setTimeout(() => {
        setCurrentStep("reset")
        switchView("resetPassword")
      }, 2000)
    } catch (error) {
      // Don't show specific error to prevent email enumeration
      setSharedSuccess("If your email exists in our system, you will receive a password reset code.")
      setTimeout(() => {
        setCurrentStep("reset")
        switchView("resetPassword")
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSharedError("")

    // Validate password match
    if (sharedFormData.password !== sharedFormData.confirmPassword) {
      setSharedError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      await userLoginService.resetPasswordWithOtp({
        email: sharedFormData.email,
        otp: sharedFormData.otp,
        newPassword: sharedFormData.password,
      })

      setSharedSuccess("Password reset successful! You can now login with your new password.")
      // Clear form and switch to login view
      setSharedFormData({
        ...sharedFormData,
        password: "",
        confirmPassword: "",
        otp: "",
      })
      setTimeout(() => {
        switchView("login")
      }, 2000)
    } catch (error) {
      setSharedError(error.response?.data?.message || "Password reset failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center">
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentStep === "request" ? "Đặt Lại Mật Khẩu" : "Tạo Mật Khẩu Mới"}
        </motion.h2>
        <motion.p
          className="text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {currentStep === "request"
            ? "Nhập email của bạn để nhận mã đặt lại mật khẩu"
            : "Nhập mã xác thực và tạo mật khẩu mới"}
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

      {currentStep === "request" ? (
        <motion.form
          className="space-y-5"
          onSubmit={handleForgotPassword}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
              Địa Chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <input
                id="forgot-email"
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
                Đang gửi mã...
              </>
            ) : (
              "Gửi Mã Đặt Lại"
            )}
          </motion.button>

          <motion.div variants={itemVariants} className="text-center mt-4">
            <button
              type="button"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => switchView("login")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại đăng nhập
            </button>
          </motion.div>
        </motion.form>
      ) : (
        <motion.form
          className="space-y-5"
          onSubmit={handleResetPassword}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
              Địa Chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <input
                id="reset-email"
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
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Mã Xác Thực
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập mã từ email của bạn"
              value={sharedFormData.otp}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật Khẩu Mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-500" />
              </div>
              <input
                id="new-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Tối thiểu 8 ký tự"
                value={sharedFormData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">
              Xác Nhận Mật Khẩu Mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-500" />
              </div>
              <input
                id="confirm-new-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập lại mật khẩu mới"
                value={sharedFormData.confirmPassword}
                onChange={handleChange}
              />
            </div>
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
                Đang đặt lại mật khẩu...
              </>
            ) : (
              "Đặt Lại Mật Khẩu"
            )}
          </motion.button>

          <motion.div variants={itemVariants} className="text-center mt-4">
            <button
              type="button"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => switchView("login")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại đăng nhập
            </button>
          </motion.div>
        </motion.form>
      )}
    </>
  )
}

