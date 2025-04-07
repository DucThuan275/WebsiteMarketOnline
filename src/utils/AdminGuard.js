import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AdminGuard = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Kiểm tra token còn hạn không
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        setIsAuthorized(false);
        return;
      }

      // Kiểm tra role ADMIN
      if (decoded.role === "ADMIN") {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    // Đang kiểm tra xác thực
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (isAuthorized === false) {
    // Không có quyền, chuyển hướng đến trang đăng nhập admin
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // Có quyền ADMIN, cho phép truy cập
  return children;
};

export default AdminGuard;
