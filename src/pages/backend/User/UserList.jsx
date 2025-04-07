"use client"

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeleteUser from "./DeleteUser";
import { Eye, Trash2, Search, RefreshCw, Plus, AlertCircle, User, Mail, Phone } from 'lucide-react';
import UserService from "../../../api/UserService";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersResponse = await UserService.getAllUsers()
      setUsers(usersResponse);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
      console.error("❌ Lỗi khi tải danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    fetchUsers();
    setShowDeleteModal(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.firstname && user.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastname && user.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.mobileNumber && user.mobileNumber.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

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

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Quản lý người dùng</h1>
          <Link
            to=""
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
          >
            <Plus size={18} />
            Thêm người dùng
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Người dùng</option>
            <option value="SELLER">Người bán</option>
          </select>

          <button
            onClick={fetchUsers}
            className="flex items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800/30 p-6 rounded-lg text-center">
            <AlertCircle className="mx-auto h-12 w-12 mb-2 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-750 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <User size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">Không tìm thấy người dùng nào</p>
            <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                          <User size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.firstname} {user.lastname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-300">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {user.mobileNumber ? (
                        <div className="flex items-center text-gray-300">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {user.mobileNumber}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Xem"
                        >
                          <Eye size={16} />
                          <span className="sr-only">Xem</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-red-600 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteUser
          userId={selectedUserId}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default UserList;
