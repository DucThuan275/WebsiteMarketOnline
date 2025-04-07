"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/authService";

const StepRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    mobileNumber: "",
    gender: "MALE",
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation for each step
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!userData.email.trim()) newErrors.email = "Vui lòng nhập email";
      if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
      if (!userData.password) newErrors.password = "Vui lòng nhập mật khẩu";
      if (userData.password && userData.password.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      }
      if (userData.password !== userData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    if (currentStep === 2) {
      if (!userData.firstName.trim()) newErrors.firstName = "Vui lòng nhập tên";
      if (!userData.lastName.trim()) newErrors.lastName = "Vui lòng nhập họ";
    }

    if (currentStep === 3) {
      if (!userData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
      if (!userData.mobileNumber.trim())
        newErrors.mobileNumber = "Vui lòng nhập số điện thoại";
      if (
        userData.mobileNumber &&
        !/^\d{10}$/.test(userData.mobileNumber.replace(/\s/g, ""))
      ) {
        newErrors.mobileNumber = "Số điện thoại phải có 10 chữ số";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const formattedData = { ...userData, role: "ADMIN" };
      await authService.register(formattedData);
      navigate("/authenticate");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      setApiError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại sau."
      );
      setStep(1); // Return to first step on error
    } finally {
      setLoading(false);
    }
  };

  // Render progress steps
  const renderProgress = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepNumber
                    ? "border-rose-500 bg-rose-500/20 text-rose-400"
                    : "border-gray-700 bg-gray-800/50 text-gray-500"
                } transition-all duration-300`}
              >
                {step > stepNumber ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`mt-2 text-xs ${
                  step >= stepNumber ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {stepNumber === 1 && "Tài khoản"}
                {stepNumber === 2 && "Cá nhân"}
                {stepNumber === 3 && "Liên hệ"}
                {stepNumber === 4 && "Xác nhận"}
              </span>
            </div>
          ))}
        </div>

        <div className="relative mt-2">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 rounded-full">
            <div
              className="h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${(step - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Step 1: Account Information
  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-gray-200 mb-4">
          Thông tin tài khoản
        </h3>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className={`w-full bg-gray-800/50 border ${
              errors.email ? "border-rose-500" : "border-gray-700"
            } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
          />
          {errors.email && (
            <p className="mt-1 text-rose-400 text-xs">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full bg-gray-800/50 border ${
                errors.password ? "border-rose-500" : "border-gray-700"
              } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-rose-400 text-xs">{errors.password}</p>
          )}
          <p className="mt-1 text-gray-400 text-xs">
            Mật khẩu phải có ít nhất 8 ký tự
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Xác nhận mật khẩu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full bg-gray-800/50 border ${
                errors.confirmPassword ? "border-rose-500" : "border-gray-700"
              } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-rose-400 text-xs">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Step 2: Personal Information
  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-gray-200 mb-4">
          Thông tin cá nhân
        </h3>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Họ <span className="text-rose-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              placeholder="Nguyễn"
              className={`w-full bg-gray-800/50 border ${
                errors.lastName ? "border-rose-500" : "border-gray-700"
              } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
            />
            {errors.lastName && (
              <p className="mt-1 text-rose-400 text-xs">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Tên <span className="text-rose-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              placeholder="Văn A"
              className={`w-full bg-gray-800/50 border ${
                errors.firstName ? "border-rose-500" : "border-gray-700"
              } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
            />
            {errors.firstName && (
              <p className="mt-1 text-rose-400 text-xs">{errors.firstName}</p>
            )}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Giới tính
          </label>
          <select
            id="gender"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>
    );
  };

  // Step 3: Contact Information
  const renderStep3 = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-gray-200 mb-4">
          Thông tin liên hệ
        </h3>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Địa chỉ <span className="text-rose-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            name="address"
            value={userData.address}
            onChange={handleChange}
            placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
            className={`w-full bg-gray-800/50 border ${
              errors.address ? "border-rose-500" : "border-gray-700"
            } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
          />
          {errors.address && (
            <p className="mt-1 text-rose-400 text-xs">{errors.address}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label
            htmlFor="mobileNumber"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <input
            id="mobileNumber"
            type="text"
            name="mobileNumber"
            value={userData.mobileNumber}
            onChange={handleChange}
            placeholder="0912345678"
            className={`w-full bg-gray-800/50 border ${
              errors.mobileNumber ? "border-rose-500" : "border-gray-700"
            } rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all duration-200`}
          />
          {errors.mobileNumber && (
            <p className="mt-1 text-rose-400 text-xs">{errors.mobileNumber}</p>
          )}
          <p className="mt-1 text-gray-400 text-xs">
            Số điện thoại phải có 10 chữ số
          </p>
        </div>
      </div>
    );
  };

  // Step 4: Review Information
  const renderStep4 = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-gray-200 mb-4">
          Xác nhận thông tin
        </h3>

        <div className="space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Thông tin tài khoản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-200">{userData.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mật khẩu</p>
                <p className="text-sm text-gray-200">••••••••</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Thông tin cá nhân
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Họ</p>
                <p className="text-sm text-gray-200">{userData.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tên</p>
                <p className="text-sm text-gray-200">{userData.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Giới tính</p>
                <p className="text-sm text-gray-200">
                  {userData.gender === "MALE"
                    ? "Nam"
                    : userData.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Địa chỉ</p>
                <p className="text-sm text-gray-200">{userData.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="text-sm text-gray-200">{userData.mobileNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-400 mb-2">
            Bằng cách nhấn "Đăng ký", bạn đồng ý với các điều khoản và điều kiện
            của chúng tôi.
          </p>
        </div>
      </div>
    );
  };

  // Render navigation buttons
  const renderNavigation = () => {
    return (
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="py-2.5 px-4 rounded-lg font-medium text-gray-300 transition-all duration-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Quay lại
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="py-2.5 px-4 rounded-lg font-medium text-gray-300 transition-all duration-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Đăng nhập
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Tiếp tục
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`py-2.5 px-4 rounded-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng ký"
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-950 text-gray-100">
      <div className="w-full max-w-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wider uppercase mb-2">
          VDUCKTIE FASHION
          </h1>
          <div className="w-16 h-0.5 bg-rose-400 mx-auto"></div>
        </div>

        {/* Registration Card */}
        <div className="backdrop-blur-sm bg-gray-900/70 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-medium text-center">Đăng ký Admin</h2>
            <p className="text-gray-400 text-center mt-1 text-sm">
              Chỉ dành cho quản trị viên
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {apiError && (
              <div className="mb-6 bg-rose-950/50 border border-rose-800 text-rose-200 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {apiError}
              </div>
            )}

            {/* Progress Steps */}
            {renderProgress()}

            {/* Step Content */}
            <form>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}

              {/* Navigation Buttons */}
              {renderNavigation()}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>
            © {new Date().getFullYear()} ELEGANCE. Tất cả các quyền được bảo
            lưu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepRegister;
