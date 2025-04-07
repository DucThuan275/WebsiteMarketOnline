"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Calendar,
  Phone,
  MapPin,
  MoonIcon as Venus,
  SpaceIcon as Mars,
  Star,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  X,
} from "lucide-react"
import UserService from "../../../api/UserService"
import userLoginService from "../../../api/userLoginService"
import { Link } from "react-router-dom"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const ProfileField = ({ icon: Icon, label, value }) => (
  <motion.div variants={itemVariants} className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
    {Icon && <Icon className="w-6 h-6 text-blue-500" />}
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value || "Không có thông tin"}</p>
    </div>
  </motion.div>
)

export default function Profile() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 2FA state
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [twoFactorError, setTwoFactorError] = useState("")
  const [twoFactorSuccess, setTwoFactorSuccess] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await UserService.getCurrentUserProfile()
        setUserData(data)
        // Check if 2FA is enabled for the user
        setTwoFactorEnabled(data.twoFactorEnabled || false)
      } catch (err) {
        setError("Không thể tải thông tin người dùng")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Password change handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    if (passwordError) setPasswordError("")
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess("")

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp")
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự")
      setPasswordLoading(false)
      return
    }

    try {
      // Call API to change password
      await UserService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setPasswordSuccess("Mật khẩu đã được thay đổi thành công")

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Close modal after a delay
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess("")
      }, 2000)
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Không thể thay đổi mật khẩu. Vui lòng thử lại.")
    } finally {
      setPasswordLoading(false)
    }
  }

  // 2FA handlers
  const handle2FAToggle = async () => {
    setTwoFactorLoading(true)
    setTwoFactorError("")
    setTwoFactorSuccess("")
    setOtpSent(false)
    setOtpCode("")

    try {
      if (twoFactorEnabled) {
        // If 2FA is enabled, show modal to confirm disabling
        setShow2FAModal(true)
      } else {
        // If 2FA is disabled, send OTP and show modal to enable
        await userLoginService.sendOtp(userData.email)
        setOtpSent(true)
        setShow2FAModal(true)
        setTwoFactorSuccess("Mã xác thực đã được gửi đến email của bạn")
      }
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Không thể gửi mã xác thực. Vui lòng thử lại.")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleOtpChange = (e) => {
    setOtpCode(e.target.value)
    if (twoFactorError) setTwoFactorError("")
  }

  const handleResendOtp = async () => {
    setTwoFactorLoading(true)
    setTwoFactorError("")
    setTwoFactorSuccess("")

    try {
      await userLoginService.sendOtp(userData.email)
      setTwoFactorSuccess("Mã xác thực đã được gửi lại thành công")
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Không thể gửi lại mã xác thực. Vui lòng thử lại.")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    setTwoFactorLoading(true)
    setTwoFactorError("")
    setTwoFactorSuccess("")

    try {
      // Verify OTP and enable 2FA
      await userLoginService.verifyOtp({
        email: userData.email,
        otp: otpCode,
      })

      await userLoginService.enableTwoFactor(userData.email)
      setTwoFactorEnabled(true)
      setTwoFactorSuccess("Xác thực hai yếu tố đã được bật thành công")

      // Close modal after a delay
      setTimeout(() => {
        setShow2FAModal(false)
        setTwoFactorSuccess("")
      }, 2000)
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Không thể bật xác thực hai yếu tố. Vui lòng thử lại.")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setTwoFactorLoading(true)
    setTwoFactorError("")
    setTwoFactorSuccess("")

    try {
      // Disable 2FA
      await userLoginService.disableTwoFactor(userData.email)
      setTwoFactorEnabled(false)
      setTwoFactorSuccess("Xác thực hai yếu tố đã được tắt thành công")

      // Close modal after a delay
      setTimeout(() => {
        setShow2FAModal(false)
        setTwoFactorSuccess("")
      }, 2000)
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || "Không thể tắt xác thực hai yếu tố. Vui lòng thử lại.")
    } finally {
      setTwoFactorLoading(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 w-48 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 w-32 rounded"></div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/trang-chu" className="text-gray-500 hover:text-blue-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/trang-chu/nguoi-dung/thong-tin-nguoi-dung" className="text-gray-500 hover:text-blue-600">
              Người dùng
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 font-semibold">Thông tin cá nhân</li>
        </ol>
      </nav>

      {/* Profile Container */}
      <motion.div
        className="bg-white shadow-xl rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="container mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white rounded-xl shadow-lg mb-6">
          <div className="flex items-center">
            <User className="w-12 h-12 mr-4 bg-white/20 p-2 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">
                {userData.firstname} {userData.lastname}
              </h2>
              <p className="text-blue-100 flex items-center">
                <Star className="w-4 h-4 mr-2" /> {userData.role}
              </p>
            </div>

            {/* 2FA Status Badge */}
            <div className="ml-auto">
              <div
                className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  twoFactorEnabled ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                }`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {twoFactorEnabled ? "2FA Đã Bật" : "2FA Chưa Bật"}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Thông tin cá nhân</h3>

          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <ProfileField icon={User} label="Họ" value={userData.firstname} />
            <ProfileField icon={User} label="Tên" value={userData.lastname} />
            <ProfileField icon={Mail} label="Email" value={userData.email} />
            <ProfileField icon={Calendar} label="Ngày sinh" value={userData.dob} />
            <ProfileField icon={MapPin} label="Địa chỉ" value={userData.address} />
            <ProfileField icon={Phone} label="Số điện thoại" value={userData.mobileNumber} />
            <ProfileField icon={userData.gender === "Nam" ? Mars : Venus} label="Giới tính" value={userData.gender} />
            <ProfileField icon={Shield} label="Xác thực hai yếu tố" value={twoFactorEnabled ? "Đã bật" : "Chưa bật"} />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-100 p-6 flex flex-wrap justify-end gap-4">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            onClick={() => setShowPasswordModal(true)}
          >
            Thay đổi mật khẩu
          </button>

          <button
            className={`px-6 py-2 rounded-lg transition flex items-center ${
              twoFactorEnabled
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
            onClick={handle2FAToggle}
            disabled={twoFactorLoading}
          >
            <Shield className="w-4 h-4 mr-2" />
            {twoFactorLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
            {twoFactorEnabled ? "Tắt xác thực hai yếu tố" : "Bật xác thực hai yếu tố"}
          </button>
        </div>
      </motion.div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-500" />
                Thay đổi mật khẩu
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6">
              {passwordError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-600">{passwordSuccess}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 8 ký tự</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                {twoFactorEnabled ? "Tắt xác thực hai yếu tố" : "Bật xác thực hai yếu tố"}
              </h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {twoFactorError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-600">{twoFactorError}</p>
                </div>
              )}

              {twoFactorSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-600">{twoFactorSuccess}</p>
                </div>
              )}

              {twoFactorEnabled ? (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Bạn đang chuẩn bị tắt xác thực hai yếu tố. Điều này sẽ làm giảm tính bảo mật cho tài khoản của bạn.
                  </p>
                  <p className="text-gray-600">Bạn có chắc chắn muốn tiếp tục?</p>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShow2FAModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleDisable2FA}
                      disabled={twoFactorLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                    >
                      {twoFactorLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        "Tắt xác thực hai yếu tố"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Xác thực hai yếu tố giúp bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực mỗi khi đăng nhập.
                  </p>

                  {otpSent && (
                    <>
                      <div>
                        <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Mã xác thực
                        </label>
                        <input
                          id="otpCode"
                          type="text"
                          value={otpCode}
                          onChange={handleOtpChange}
                          placeholder="Nhập mã 6 chữ số"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={twoFactorLoading}
                        className="text-sm text-blue-600 hover:text-blue-800 transition"
                      >
                        Gửi lại mã xác thực
                      </button>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShow2FAModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleEnable2FA}
                          disabled={twoFactorLoading || !otpCode}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                        >
                          {twoFactorLoading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Bật xác thực hai yếu tố"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

