"use client"

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoryService from '../../../api/CategoryService';
import { Plus, Eye, Edit, Check, X, Trash2, AlertCircle, RefreshCw, Search } from 'lucide-react';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await CategoryService.getAllCategories();
      setCategories(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await CategoryService.activateCategory(id);
      setStatusMessage('Kích hoạt danh mục sản phẩm thành công!');
      fetchCategories();
    } catch (err) {
      setError('Failed to activate category');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await CategoryService.deactivateCategory(id);
      setStatusMessage('Ngưng kích hoạt danh mục sản phẩm thành công!');
      fetchCategories();
    } catch (err) {
      setError('Failed to deactivate category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      try {
        await CategoryService.deleteCategory(id);
        setStatusMessage('Xóa danh mục sản phẩm thành công!');
        fetchCategories(); // Refresh the list after deletion
      } catch (err) {
        // Show a user-friendly alert instead of console error
        alert("Danh mục này có sản phẩm liên kết, không thể xóa.");
        console.error("Error deleting category:", err); // Log the error for debugging
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterActive(e.target.value);
  };

  // Filter categories based on search term and active status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterActive === 'all' || 
                          (filterActive === 'active' && category.active) || 
                          (filterActive === 'inactive' && !category.active);
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Danh mục sản phẩm</h1>
          <Link
            to="/admin/categories/new"
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
          >
            <Plus size={18} />
            Thêm danh mục
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 flex justify-between items-center">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>{statusMessage}</span>
          </div>
          <button 
            onClick={() => setStatusMessage('')} 
            className="text-green-300 hover:text-green-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="text-red-300 hover:text-red-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Tìm kiếm danh mục..."
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <select
            value={filterActive}
            onChange={handleFilterChange}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang kích hoạt</option>
            <option value="inactive">Đã ngưng kích hoạt</option>
          </select>

          <button
            onClick={fetchCategories}
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
        ) : filteredCategories.length === 0 ? (
          <div className="bg-gray-750 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <AlertCircle size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">Không tìm thấy danh mục nào</p>
            <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mã danh mục</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Danh mục cha</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-300">{category.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{category.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {category.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {category.parentCategory ? category.parentCategory.name : 'Không có danh mục cha'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/categories/${category.id}`}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Xem"
                        >
                          <Eye size={16} />
                          <span className="sr-only">Xem</span>
                        </Link>
                        <Link
                          to={`/admin/categories/${category.id}/edit`}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Cập nhật"
                        >
                          <Edit size={16} />
                          <span className="sr-only">Cập nhật</span>
                        </Link>
                        {category.active ? (
                          <button
                            onClick={() => handleDeactivate(category.id)}
                            className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-yellow-600 rounded-md transition-colors"
                            title="Ngưng kích hoạt"
                          >
                            <X size={16} />
                            <span className="sr-only">Ngưng kích hoạt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(category.id)}
                            className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-green-600 rounded-md transition-colors"
                            title="Kích hoạt"
                          >
                            <Check size={16} />
                            <span className="sr-only">Kích hoạt</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(category.id)}
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
    </div>
  );
};

export default CategoryList;
