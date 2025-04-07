"use client"

import React, { useState } from "react";
import userApiService from "../../../api/UserService";
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteUser = ({ userId, onClose, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await userApiService.deleteUser(userId);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Không thể xóa người dùng. Người dùng này có danh mục con liên kết. Vui lòng thử lại.");
      console.error("❌ Lỗi khi xóa người dùng:", err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Xác nhận xóa</h2>
            <p className="text-gray-300">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 flex items-center">
            <X className="h-5 w-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;
