"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CategoryService from '../../../api/CategoryService';
import { ArrowLeft, AlertTriangle, X, Check, Info } from 'lucide-react';

const DeleteCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get all categories and find the one we need
        const allCategories = await CategoryService.getCategories();
        const foundCategory = allCategories.find(c => c.id === parseInt(id, 10));
        
        if (!foundCategory) {
          setError('Category not found');
          return;
        }
        
        setCategory(foundCategory);
        
        // Check for subcategories
        try {
          const subCats = await CategoryService.getSubCategories(parseInt(id, 10));
          setSubCategories(subCats);
        } catch (subErr) {
          console.error('Failed to load subcategories:', subErr);
          // Just assume no subcategories
          setSubCategories([]);
        }
      } catch (err) {
        setError('Failed to load category details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeactivate = async () => {
    try {
      setDeleting(true);
      await CategoryService.deactivateCategory(parseInt(id, 10));
      navigate('/admin/categories', { 
        state: { message: 'Category successfully deactivated' } 
      });
    } catch (err) {
      setError('Failed to deactivate category');
      console.error(err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Lỗi</h1>
        </div>
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-800/30 p-4 rounded-lg flex items-center">
            <AlertTriangle className="text-red-400 w-6 h-6 mr-3 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Link 
              to="/admin/categories" 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Không tìm thấy</h1>
        </div>
        <div className="p-6">
          <p className="text-gray-300">Không tìm thấy danh mục này.</p>
          <div className="mt-6 flex justify-end">
            <Link 
              to="/admin/categories" 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasSubCategories = subCategories.length > 0;

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ngưng kích hoạt danh mục</h1>
          <Link
            to={`/admin/categories/${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gray-750 rounded-lg p-5 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Xác nhận ngưng kích hoạt</h2>
          <p className="text-gray-300 mb-4">
            Bạn có chắc chắn muốn ngưng kích hoạt danh mục sau đây?
          </p>
          
          <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white font-medium">{category.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tên danh mục:</span>
                <span className="text-white font-medium">{category.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Trạng thái:</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  category.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {category.active ? 'Kích hoạt' : 'Ngưng kích hoạt'}
                </span>
              </div>
              {category.parentCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Danh mục cha:</span>
                  <span className="text-white font-medium">{category.parentCategory.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {hasSubCategories && (
            <div className="bg-yellow-900/20 border border-yellow-800/30 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <AlertTriangle className="text-yellow-400 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-medium mb-2">Cảnh báo:</p>
                  <p className="text-yellow-300">
                    Danh mục này có {subCategories.length} danh mục con sẽ bị ảnh hưởng bởi hành động này.
                  </p>
                  <ul className="mt-2 space-y-1 text-yellow-300/80">
                    {subCategories.slice(0, 5).map(subCat => (
                      <li key={subCat.id} className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2"></span>
                        {subCat.name}
                      </li>
                    ))}
                    {subCategories.length > 5 && (
                      <li className="text-yellow-300/80 italic">...và {subCategories.length - 5} danh mục khác</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {!category.active && (
            <div className="bg-blue-900/20 border border-blue-800/30 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <Info className="text-blue-400 w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-blue-300">Danh mục này đã được ngưng kích hoạt.</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Link
              to={`/admin/categories/${id}`}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-center"
            >
              <span className="flex items-center justify-center gap-2">
                <X size={16} />
                Hủy
              </span>
            </Link>
            
            <button
              onClick={handleDeactivate}
              disabled={deleting || !category.active}
              className={`px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                deleting || !category.active
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Xác nhận ngưng kích hoạt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategory;
