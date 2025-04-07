"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/authService";

const Login = ({ isAdminRoute = false }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      const decoded = await authService.decodeToken(token);
      if (isAdminRoute && decoded.role !== "ADMIN") {
        setError("Bạn không có quyền truy cập trang quản trị.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      } else {
        navigate(isAdminRoute ? "/admin/home" : "/trang-chu");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Space background with stars */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-purple-900/30"></div>

        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite`,
              }}
            ></div>
          ))}
        </div>

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white"
              style={{
                top: `${Math.random() * 70}%`,
                left: `${Math.random() * 100}%`,
                boxShadow:
                  "0 0 0 1px #ffffff10, 0 0 3px #ffffff50, 0 0 10px #ffffff20",
                transform: "rotate(-45deg)",
                animation: `shootingstar ${Math.random() * 10 + 10}s linear ${
                  Math.random() * 10
                }s infinite`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md px-4 z-10">
        <div className="backdrop-blur-sm bg-gray-900/60 rounded-2xl border border-gray-800/80 shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-medium text-center mb-6">
              {isAdminRoute ? "Quản trị viên" : "Đăng nhập tài khoản"}
            </h2>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.72 16.69 5.82 14.09H2.12V16.95C3.94 20.53 7.69 23 12 23Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.82 14.09C5.58 13.43 5.44 12.73 5.44 12C5.44 11.27 5.58 10.57 5.82 9.91V7.05H2.12C1.4 8.57 1 10.24 1 12C1 13.76 1.4 15.43 2.12 16.95L5.82 14.09Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.37C13.54 5.37 14.93 5.91 16.03 6.97L19.22 3.78C17.46 2.13 14.97 1 12 1C7.69 1 3.94 3.47 2.12 7.05L5.82 9.91C6.72 7.31 9.13 5.37 12 5.37Z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 12.073C24 5.446 18.627 0.073 12 0.073C5.373 0.073 0 5.446 0 12.073C0 18.063 4.388 23.027 10.125 23.927V15.573H7.078V12.073H10.125V9.453C10.125 6.443 11.917 4.823 14.658 4.823C15.97 4.823 17.344 5.033 17.344 5.033V7.993H15.83C14.34 7.993 13.875 8.913 13.875 9.853V12.073H17.203L16.67 15.573H13.875V23.927C19.612 23.027 24 18.063 24 12.073Z"
                    fill="#1877F2"
                  />
                </svg>
                Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/80 text-gray-400">Or</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-800/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full bg-gray-800/50 border border-blue-900/50 rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={() => navigate("/quen-mat-khau")}
                  >
                    Forgot ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-gray-800/50 border border-blue-900/50 rounded-lg py-3 px-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    required
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
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
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
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already Have An Account ?
                <button
                  onClick={() => navigate("/admin/register")}
                  className="ml-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes shootingstar {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 1;
            width: 0.5px;
            height: 0.5px;
          }
          10% {
            transform: translateX(-150px) translateY(150px) rotate(-45deg);
            opacity: 0;
            width: 15px;
            height: 1px;
          }
          100% {
            transform: translateX(-150px) translateY(150px) rotate(-45deg);
            opacity: 0;
            width: 0;
            height: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
