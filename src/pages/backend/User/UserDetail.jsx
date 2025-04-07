"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import userApiService from "../../../api/UserService";
import {
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Shield,
  UserCircle,
} from "lucide-react";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    address: "",
    mobileNumber: "",
    gender: "",
    role: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Check if we're looking at the current user profile
        if (id === "profile") {
          try {
            // First try to get from API
            const userData = await userApiService.getCurrentUserProfile();
            setUser(userData);
            setFormData(userData);
            setIsCurrentUser(true);
          } catch (apiError) {
            // If API fails, try to get from localStorage
            console.log("Failed to fetch from API, trying localStorage");
            const storedUser = JSON.parse(localStorage.getItem("user"));

            if (storedUser) {
              setUser(storedUser);
              setFormData(storedUser);
              setIsCurrentUser(true);
            } else {
              throw new Error("User data not found in localStorage");
            }
          }
        } else {
          // Add validation for id before making the API call
          const userId = Number.parseInt(id);
          if (isNaN(userId)) {
            throw new Error("Invalid user ID");
          }

          const userData = await userApiService.getUserById(userId);
          setUser(userData);
          setFormData(userData);

          // Also check if this is the current user by comparing with profile
          try {
            // First try from API
            const currentUser = await userApiService.getCurrentUserProfile();
            setIsCurrentUser(currentUser.id === userData.id);
          } catch (profileError) {
            // If API fails, try from localStorage
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
              setIsCurrentUser(storedUser.id === userData.id);
            }
          }
        }
      } catch (err) {
        setError("Failed to load user data. Please try again later.");
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const updatedUser = await userApiService.updateUserProfile(formData);
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditMode(false);
      setSuccessMessage("Thông tin người dùng đã được cập nhật thành công!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Failed to update user. Please try again.");
      console.error("Error updating user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-pink-900 text-pink-300";
      case "USER":
        return "bg-blue-900 text-blue-300";
      case "SELLER":
        return "bg-purple-900 text-purple-300";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isCurrentUser ? "Thông tin cá nhân" : "Chi tiết người dùng"}
          </h1>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {user && (
        <div className="p-6">
          <div className="bg-gray-750 rounded-lg p-5 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 mr-4">
                <UserCircle size={32} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user.firstname} {user.lastname}
                </h2>
                <div className="flex items-center mt-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${getRoleBadgeClass(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              {isCurrentUser && !isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
              )}
            </div>

            {isEditMode ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstname"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Tên
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastname"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Họ
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ""}
                        className="w-full px-4 py-2.5 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400 focus:outline-none"
                        disabled
                      />
                      <Mail
                        className="absolute left-3 top-2.5 text-gray-500"
                        size={18}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="mobileNumber"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Nhập số điện thoại"
                      />
                      <Phone
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2.5 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Nhập địa chỉ"
                      ></textarea>
                      <MapPin
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setFormData(user); // Reset form data to original user data
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Tên</h3>
                    <p className="text-white font-medium">
                      {user.firstname || "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Họ</h3>
                    <p className="text-white font-medium">
                      {user.lastname || "-"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Email</h3>
                    <div className="flex items-center">
                      <Mail className="text-gray-400 mr-2" size={16} />
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">
                      Số điện thoại
                    </h3>
                    {user.mobileNumber ? (
                      <div className="flex items-center">
                        <Phone className="text-gray-400 mr-2" size={16} />
                        <p className="text-white">{user.mobileNumber}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">-</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Vai trò</h3>
                    <div className="flex items-center">
                      <Shield className="text-gray-400 mr-2" size={16} />
                      <p className="text-white">{user.role}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Giới tính</h3>
                    <p className="text-white">{user.gender || "-"}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-gray-400 text-sm mb-1">Địa chỉ</h3>
                  {user.address ? (
                    <div className="flex items-start mt-1">
                      <MapPin
                        className="text-gray-400 mr-2 mt-0.5 flex-shrink-0"
                        size={16}
                      />
                      <p className="text-white">{user.address}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">-</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
