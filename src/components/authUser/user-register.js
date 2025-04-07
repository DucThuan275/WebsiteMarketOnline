"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
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

export default function UserRegister({
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errors, setErrors] = useState({});
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Update shared form data when component mounts
  useEffect(() => {
    if (!sharedFormData.gender) {
      setSharedFormData((prev) => ({
        ...prev,
        gender: "MALE",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSharedFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Clear shared error
    if (sharedError) {
      setSharedError("");
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!sharedFormData.firstName?.trim())
      newErrors.firstName = "First name is required";
    if (!sharedFormData.lastName?.trim())
      newErrors.lastName = "Last name is required";
    if (!sharedFormData.email?.trim()) newErrors.email = "Email is required";

    // Email format validation
    if (sharedFormData.email && !/\S+@\S+\.\S+/.test(sharedFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!sharedFormData.password) newErrors.password = "Password is required";

    // Password strength check
    if (sharedFormData.password && sharedFormData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password match
    if (sharedFormData.password !== sharedFormData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!sharedFormData.address?.trim())
      newErrors.address = "Address is required";
    if (!sharedFormData.mobileNumber?.trim())
      newErrors.mobileNumber = "Phone number is required";

    // Phone number format validation
    if (
      sharedFormData.mobileNumber &&
      !/^\d{10}$/.test(sharedFormData.mobileNumber.replace(/\s/g, ""))
    ) {
      newErrors.mobileNumber = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSharedError("");

    if (step === 3 && !validateStep3()) return;

    setLoading(true);

    try {
      const formattedData = {
        firstname: sharedFormData.firstName,
        lastname: sharedFormData.lastName,
        email: sharedFormData.email,
        password: sharedFormData.password,
        address: sharedFormData.address,
        mobileNumber: sharedFormData.mobileNumber,
        gender: sharedFormData.gender,
        role: "USER", // Default role
      };

      await userLoginService.register(formattedData);
      setRegistrationComplete(true);
      setSharedSuccess("Registration successful! Please verify your account.");
    } catch (err) {
      console.error("Registration error:", err);
      setSharedError(
        err.response?.data?.message ||
          "Registration failed. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);
    setSharedError("");

    try {
      await userLoginService.verifyAccount({
        email: sharedFormData.email,
        otp: sharedFormData.otp,
      });

      setSharedSuccess("Account verification successful! You can now login.");

      // Redirect to login after successful verification
      setTimeout(() => {
        switchView("login");
      }, 3000);
    } catch (err) {
      setSharedError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    setVerificationLoading(true);
    setSharedError("");

    try {
      await userLoginService.sendOtp(sharedFormData.email);
      setSharedSuccess("Verification code has been resent successfully!");
    } catch (err) {
      setSharedError(
        "Unable to resend verification code. Please try again later."
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const renderStepIndicator = () => {
    if (registrationComplete) return null;

    return (
      <motion.div
        className="flex items-center justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                s === step
                  ? "bg-blue-600 text-white"
                  : s < step
                  ? "bg-blue-200 text-blue-700"
                  : "bg-gray-100 text-gray-400"
              } transition-all duration-300`}
            >
              {s === 1 ? (
                <User size={16} />
              ) : s === 2 ? (
                <Lock size={16} />
              ) : (
                <MapPin size={16} />
              )}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-1 ${
                  s < step ? "bg-blue-600" : "bg-gray-200"
                } transition-all duration-300`}
              />
            )}
          </div>
        ))}
      </motion.div>
    );
  };

  const renderVerificationStep = () => {
    return (
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <Mail className="mx-auto text-blue-500 w-16 h-16 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Xác Thực Tài Khoản
          </h3>
          <p className="text-gray-600">
            Chúng tôi đã gửi mã xác thực đến email{" "}
            <span className="font-medium">{sharedFormData.email}</span>. Vui
            lòng kiểm tra hộp thư đến và nhập mã xác thực bên dưới.
          </p>
        </motion.div>

        {sharedError && (
          <motion.div
            variants={itemVariants}
            className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6 text-sm flex items-center border border-red-200"
          >
            <AlertCircle className="w-5 h-5 mr-2" /> {sharedError}
          </motion.div>
        )}

        {sharedSuccess && (
          <motion.div
            variants={itemVariants}
            className="bg-green-50 text-green-600 px-4 py-3 rounded-md mb-6 text-sm flex items-center border border-green-200"
          >
            <CheckCircle className="w-5 h-5 mr-2" /> {sharedSuccess}
          </motion.div>
        )}

        <motion.form
          variants={itemVariants}
          onSubmit={handleVerifyAccount}
          className="max-w-xs mx-auto"
        >
          <div className="mb-4">
            <label
              htmlFor="verificationCode"
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Mã Xác Thực
            </label>
            <input
              id="verificationCode"
              name="otp"
              type="text"
              value={sharedFormData.otp}
              onChange={handleChange}
              placeholder="Nhập mã xác thực"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={verificationLoading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center transition-all mb-3 ${
              verificationLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {verificationLoading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Đang xác thực...
              </span>
            ) : (
              "Xác Thực Tài Khoản"
            )}
          </button>

          <button
            type="button"
            onClick={handleResendVerificationCode}
            disabled={verificationLoading}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Gửi lại mã xác thực
          </button>
        </motion.form>
      </motion.div>
    );
  };

  const renderStepContent = () => {
    if (registrationComplete) {
      return renderVerificationStep();
    }

    switch (step) {
      case 1:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h3
              variants={itemVariants}
              className="text-lg font-medium text-gray-800 mb-4"
            >
              Thông Tin Cá Nhân
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Họ
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Nguyễn"
                    value={sharedFormData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                    size={18}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </motion.div>
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="Văn A"
                    value={sharedFormData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                    size={18}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={sharedFormData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                  size={18}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="button"
              onClick={nextStep}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all mt-4 flex items-center justify-center"
            >
              Tiếp tục
              <ArrowLeft className="ml-2 rotate-180" size={16} />
            </motion.button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h3
              variants={itemVariants}
              className="text-lg font-medium text-gray-800 mb-4"
            >
              Thông Tin Bảo Mật
            </motion.h3>
            <motion.div variants={itemVariants} className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Tối thiểu 8 ký tự"
                  value={sharedFormData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={sharedFormData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="flex space-x-4 mt-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-1" /> Quay lại
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="w-2/3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center"
              >
                Tiếp tục
                <ArrowLeft className="ml-2 rotate-180" size={16} />
              </button>
            </motion.div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h3
              variants={itemVariants}
              className="text-lg font-medium text-gray-800 mb-4"
            >
              Thông Tin Liên Hệ
            </motion.h3>
            <motion.div variants={itemVariants} className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Địa Chỉ
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Địa chỉ đầy đủ của bạn"
                  value={sharedFormData.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <MapPin
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                  size={18}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số Điện Thoại
              </label>
              <div className="relative">
                <input
                  id="mobileNumber"
                  type="tel"
                  name="mobileNumber"
                  placeholder="0912345678"
                  value={sharedFormData.mobileNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.mobileNumber ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
                  size={18}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.mobileNumber}
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Giới Tính
              </label>
              <select
                id="gender"
                name="gender"
                value={sharedFormData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </motion.div>

            {sharedError && (
              <motion.div
                variants={itemVariants}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4 text-sm flex items-center border border-red-200"
              >
                <AlertCircle className="w-5 h-5 mr-2" /> {sharedError}
              </motion.div>
            )}

            {sharedSuccess && (
              <motion.div
                variants={itemVariants}
                className="bg-green-50 text-green-600 px-4 py-3 rounded-md mb-4 text-sm flex items-center border border-green-200"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> {sharedSuccess}
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="flex space-x-4 mt-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-1" /> Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-2/3 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center transition-all ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus size={18} className="mr-2" />
                    Hoàn Tất Đăng Ký
                  </span>
                )}
              </button>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
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
          {registrationComplete ? "Xác Thực Tài Khoản" : "Tạo Tài Khoản"}
        </motion.h2>
        <motion.p
          className="text-gray-500 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {registrationComplete
            ? "Vui lòng xác thực email để hoàn tất đăng ký"
            : "Tham gia cùng chúng tôi để nhận ưu đãi và khuyến mãi công nghệ độc quyền"}
        </motion.p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit}>{renderStepContent()}</form>

      <motion.div
        variants={itemVariants}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-gray-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => switchView("login")}
            className="text-blue-600 font-medium hover:underline transition-colors"
          >
            Đăng nhập
          </button>
        </p>
      </motion.div>
    </>
  );
}
