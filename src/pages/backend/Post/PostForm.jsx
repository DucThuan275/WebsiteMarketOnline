"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Image, Loader2, Save, X } from "lucide-react";
import PostService from "../../../api/PostServive";

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get current user ID from authentication context or localStorage in a real app
    // For now, we'll use a placeholder value
    setUserId(2); // Replace with actual user ID retrieval logic

    // Load post data if in edit mode
    if (isEditMode) {
      loadPostData();
    }
  }, [id]);

  const loadPostData = async () => {
    try {
      const postData = await PostService.getPostById(id);
      const post = postData;

      setFormData({
        title: post.title,
        content: post.content,
      });

      // If post has an image, set the preview
      if (post.imagePost) {
        setPreview(PostService.getPostImageUrl(id));
      }

      setLoading(false);
    } catch (err) {
      setError("Không thể tải dữ liệu bài viết. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    // Reset the file input
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        // Update existing post
        await PostService.updatePost(
          id,
          formData.title,
          formData.content,
          imageFile
        );
      } else {
        // Create new post
        await PostService.createPost(formData, userId, imageFile);
      }

      navigate("/admin/posts");
    } catch (err) {
      setError(
        `Không thể ${
          isEditMode ? "cập nhật" : "tạo"
        } bài viết. Vui lòng thử lại.`
      );
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden container mx-auto">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">
          {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
        </h2>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Tiêu đề
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-400"
            placeholder="Nhập tiêu đề bài viết"
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Nội dung
          </label>
          <textarea
            id="content"
            name="content"
            rows="12"
            value={formData.content}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-gray-400"
            placeholder="Viết nội dung bài viết tại đây..."
          ></textarea>
        </div>

        <div>
          <label
            htmlFor="imageFile"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            {isEditMode
              ? "Cập nhật hình ảnh (tùy chọn)"
              : "Thêm hình ảnh (tùy chọn)"}
          </label>
          <div className="mt-1 flex items-center">
            <label className="flex-1 flex flex-col items-center px-4 py-6 bg-gray-700 text-pink-400 rounded-md shadow-md tracking-wide border border-gray-600 cursor-pointer hover:bg-gray-650 transition-colors">
              <Image className="w-6 h-6 mb-2" />
              <span className="text-base leading-normal">Chọn tệp</span>
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {imageFile && (
            <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
              <p className="truncate max-w-xs">Đã chọn: {imageFile.name}</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-2 p-1 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Xóa</span>
              </button>
            </div>
          )}
        </div>

        {preview && (
          <div>
            <p className="block text-sm font-medium text-gray-300 mb-2">
              Xem trước hình ảnh
            </p>
            <div className="relative w-full border border-gray-600 rounded-md overflow-hidden bg-gray-900">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="max-h-64 mx-auto object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-gray-800/80 text-white rounded-full hover:bg-red-600/80 transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Xóa hình ảnh</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              loading
                ? "bg-pink-700/50 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-500"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Cập nhật bài viết" : "Tạo bài viết"}
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/posts")}
            className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
