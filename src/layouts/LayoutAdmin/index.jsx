import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const LayoutAdmin = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <div className="bg-gray-800 p-4 md:p-6 shadow-lg border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              <span className="text-pink-500">TRANG QUẢN TRỊ</span>
            </h1>
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline-block px-3 py-1 bg-pink-600 text-white text-xs font-medium rounded-full">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 bg-gray-900">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LayoutAdmin;
