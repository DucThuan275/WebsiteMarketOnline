import React, { useEffect, useState } from "react";
import { 
  User, Mail, Phone, MapPin, Save, RefreshCw, AlertCircle 
} from 'lucide-react';
import UserService from "../../../api/UserService";
import { Link } from "react-router-dom";

const UpdateProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    address: "",
    mobileNumber: "",
    gender: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUser = await UserService.getCurrentUserProfile();
        setUser(currentUser);
        setFormData(currentUser);
      } catch (err) {
        setError("Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.");
        console.error("Lỗi tải dữ liệu người dùng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstname.trim()) {
      errors.firstname = "Tên không được để trống";
    }
    if (!formData.lastname.trim()) {
      errors.lastname = "Họ không được để trống";
    }
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Số điện thoại không được để trống";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = "Số điện thoại không hợp lệ";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await UserService.updateUserProfile(formData);
      setUser(updatedUser);
      setFormData(updatedUser);
      // Show success toast or notification
    } catch (err) {
      setError("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      console.error("Lỗi cập nhật hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link 
              to="/trang-chu" 
              className="text-gray-500 hover:text-blue-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link 
              to="/trang-chu/nguoi-dung/thong-tin-nguoi-dung" 
              className="text-gray-500 hover:text-blue-600"
            >
              Người dùng
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 font-semibold">Cập nhật thông tin</li>
        </ol>
      </nav>

      {/* Profile Update Container */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Page Header */}
        <div className="container mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white rounded-xl shadow-lg mb-6">
          <div className="flex items-center">
            <User className="w-12 h-12 mr-4 bg-white/20 p-2 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">Chỉnh sửa thông tin cá nhân</h2>
              <p className="text-blue-100">Cập nhật thông tin của bạn</p>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstname" className="block text-gray-700 mb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" /> Tên
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                  ${formErrors.firstname 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'border-gray-300 focus:ring-blue-300'}`}
                required
              />
              {formErrors.firstname && (
                <p className="text-red-500 text-sm mt-1">{formErrors.firstname}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastname" className="block text-gray-700 mb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" /> Họ
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                  ${formErrors.lastname 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'border-gray-300 focus:ring-blue-300'}`}
                required
              />
              {formErrors.lastname && (
                <p className="text-red-500 text-sm mt-1">{formErrors.lastname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-500" /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-gray-700 mb-2 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-500" /> Số điện thoại
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber || ""}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                  ${formErrors.mobileNumber 
                    ? 'border-red-500 focus:ring-red-300' 
                    : 'border-gray-300 focus:ring-blue-300'}`}
                required
              />
              {formErrors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">{formErrors.mobileNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-gray-700 mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" /> Địa chỉ
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                rows="4"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;