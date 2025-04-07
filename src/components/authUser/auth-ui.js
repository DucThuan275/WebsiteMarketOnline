"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import UserLogin from "./user-login";
import UserRegister from "./user-register";
import UserForgotPassword from "./user-forgot-password";
import UserVerify from "./user-verify";

export default function AuthUI() {
  const [view, setView] = useState("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    otp: "",
    provider: "",
    token: "",
    address: "",
    mobileNumber: "",
    gender: "MALE",
  });

  const switchView = (newView) => {
    setView(newView);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-black p-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Brand Header */}
          <div className="relative bg-gradient-to-r from-blue-800 to-blue-900 text-white py-6 px-8 text-center overflow-hidden">
            <div className="absolute bottom-0 right-10 opacity-40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-300"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 opacity-40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-300"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
            <div className="absolute top-0 right-1/4 opacity-40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-300"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
              </svg>
            </div>

            <div className="relative z-10">
              <motion.h1
                className="text-2xl font-bold tracking-wider"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                VDUCKTIE STORE
              </motion.h1>
              <motion.p
                className="text-blue-100 mt-1 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {view === "login" && "Đăng nhập để truy cập tài khoản của bạn"}
                {view === "register" &&
                  "Tham gia cùng chúng tôi để nhận ưu đãi công nghệ độc quyền"}
                {view === "forgotPassword" &&
                  "Đặt lại mật khẩu tài khoản của bạn"}
                {view === "resetPassword" && "Tạo mật khẩu mới an toàn"}
                {view === "verifyOtp" && "Xác minh danh tính của bạn"}
                {view === "verifyAccount" && "Kích hoạt tài khoản của bạn"}
              </motion.p>
            </div>
          </div>

          <div className="p-8">
            {view === "login" && (
              <UserLogin
                switchView={switchView}
                setSharedFormData={setFormData}
                sharedFormData={formData}
                setSharedError={setError}
                setSharedSuccess={setSuccess}
                sharedError={error}
                sharedSuccess={success}
              />
            )}

            {view === "register" && (
              <UserRegister
                switchView={switchView}
                setSharedFormData={setFormData}
                sharedFormData={formData}
                setSharedError={setError}
                setSharedSuccess={setSuccess}
                sharedError={error}
                sharedSuccess={success}
              />
            )}

            {(view === "forgotPassword" || view === "resetPassword") && (
              <UserForgotPassword
                switchView={switchView}
                setSharedFormData={setFormData}
                sharedFormData={formData}
                setSharedError={setError}
                setSharedSuccess={setSuccess}
                sharedError={error}
                sharedSuccess={success}
                currentView={view}
              />
            )}

            {(view === "verifyOtp" || view === "verifyAccount") && (
              <UserVerify
                type={view}
                switchView={switchView}
                setSharedFormData={setFormData}
                sharedFormData={formData}
                setSharedError={setError}
                setSharedSuccess={setSuccess}
                sharedError={error}
                sharedSuccess={success}
              />
            )}
          </div>
        </div>

        <motion.div
          className="mt-6 text-center text-blue-200 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          © {new Date().getFullYear()} VDUCKTIE STORE. Tất cả quyền được bảo
          lưu.
        </motion.div>
      </div>
    </div>
  );
}
