"use client"

import React, { useState } from 'react';
import BannerService from '../../../api/BannerService';
import { Upload, Image, Link2, Hash, Check, AlertCircle, Save, X } from 'lucide-react';

const CreateBanner = ({ onBannerCreated }) => {
  const [banner, setBanner] = useState({
    title: '',
    description: '',
    linkUrl: '',
    isActive: true,
    displayOrder: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBanner({
      ...banner,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setImageFile(file);
      setError('');
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!banner.title.trim()) {
      setError('Tiêu đề là bắt buộc');
      return;
    }
    
    if (!imageFile) {
      setError('Hình ảnh là bắt buộc');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const createdBanner = await BannerService.createBanner(banner, imageFile);
      
      // Reset form
      setBanner({
        title: '',
        description: '',
        linkUrl: '',
        isActive: true,
        displayOrder: 1
      });
      setImageFile(null);
      setPreviewUrl('');
      
      // Show success message
      setSuccess('Tạo banner thành công!');
      
      // Notify parent component
      if (onBannerCreated) {
        onBannerCreated(createdBanner);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Không thể tạo banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Tạo Banner Mới</h2>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
            <p className="text-green-300">{success}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Tiêu đề <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={banner.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Nhập tiêu đề banner"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={banner.description || ''}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Nhập mô tả cho banner (tùy chọn)"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-300">
              Đường dẫn URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="linkUrl"
                name="linkUrl"
                value={banner.linkUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Link2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-300">
                Thứ tự hiển thị
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  value={banner.displayOrder}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <Hash className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
            
            <div className="flex items-center h-full pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={banner.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">Kích hoạt</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-300">
              Hình ảnh Banner <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                required={!previewUrl}
              />
              <label
                htmlFor="image"
                className="flex items-center justify-center w-full px-4 py-6 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-650 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-300">
                    {imageFile ? imageFile.name : "Nhấp để tải lên hình ảnh banner"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WEBP (Tối đa 5MB)</span>
                </div>
              </label>
            </div>
          </div>
          
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-300 mb-2">Xem trước:</p>
              <div className="relative inline-block">
                <div className="relative w-full h-48 overflow-hidden rounded-lg bg-gray-700">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Xem trước banner"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400/EEE/31343C";
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo Banner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBanner;
