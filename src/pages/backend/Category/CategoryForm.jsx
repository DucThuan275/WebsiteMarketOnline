"use client"

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import CategoryService from "../../../api/CategoryService";
import { ArrowLeft, Save, X, AlertCircle, Info } from 'lucide-react';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  const queryParams = new URLSearchParams(location.search);
  const parentId = queryParams.get("parentId");

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategoryId: parentId || "",
    active: true,
  });

  const [loading, setLoading] = useState(isEditing);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await CategoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const allCategories = await CategoryService.getCategories();
        const foundCategory = allCategories.find((c) => c.id === parseInt(id, 10));

        if (!foundCategory) {
          setError("Category not found");
          return;
        }

        setFormData({
          name: foundCategory.name,
          description: foundCategory.description || "",
          parentCategoryId: foundCategory.parentCategory ? foundCategory.parentCategory.id : "",
          active: foundCategory.active,
        });
      } catch (err) {
        setError("Failed to load category data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const categoryData = {
        ...formData,
        parentCategoryId: formData.parentCategoryId ? parseInt(formData.parentCategoryId, 10) : null,
      };

      if (isEditing) {
        await CategoryService.updateCategory(parseInt(id, 10), categoryData);
        navigate(`/admin/categories/${id}`, { state: { message: "Category updated successfully" } });
      } else {
        const newCategory = await CategoryService.createCategory(categoryData);
        navigate(`/admin/categories/${newCategory?.id || ""}`, { state: { message: "Category created successfully" } });
      }
    } catch (err) {
      setError(`Failed to ${isEditing ? "update" : "create"} category: ${err.message || "Unknown error"}`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
            {isEditing ? "Cập nhật danh mục" : "Tạo danh mục mới"}
          </h1>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!isEditing && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg flex items-start">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-blue-300">
              Tạo danh mục mới sẽ giúp phân loại sản phẩm của bạn một cách hiệu quả.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Tên danh mục <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên danh mục"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Nhập mô tả cho danh mục (tùy chọn)"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="parentCategoryId" className="block text-sm font-medium text-gray-300">
              Danh mục cha
            </label>
            <select
              id="parentCategoryId"
              name="parentCategoryId"
              value={formData.parentCategoryId}
              onChange={handleChange}
              disabled={loadingCategories}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Không có (Danh mục cấp cao nhất)</option>
              {categories
                .filter((category) => category.id !== parseInt(id, 10))
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            {loadingCategories && (
              <div className="flex items-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                <span className="text-gray-400 text-sm">Đang tải danh mục...</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-pink-600 focus:ring-pink-500 focus:ring-offset-gray-800"
            />
            <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-300">
              Kích hoạt
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/admin/categories/${id}` : "/admin/categories")}
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
                  {isEditing ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? "Cập nhật danh mục" : "Tạo danh mục"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
