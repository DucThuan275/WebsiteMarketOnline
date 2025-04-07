"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import CategoryService from "../../../api/CategoryService";
import ProductService from "../../../api/ProductService";

const ProductCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
  });

  const [primaryImage, setPrimaryImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const [loading, setLoading] = useState(isEditing);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await CategoryService.getActiveCategories();

        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : [];
        setCategories(fetchedCategories);
      } catch (err) {
        setError("Failed to load categories");
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product data if editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const product = await ProductService.getProductById(Number(id));
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          categoryId: product.categoryId,
        });

        // Set image preview if available
        if (product.imageUrl) {
          setImagePreview(
            product.imageUrl.startsWith("http")
              ? product.imageUrl
              : `http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`
          );
        }

        setError(null);
      } catch (err) {
        setError("Failed to load product data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Primary image must be a valid image file (JPEG, PNG, GIF, WEBP)"
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Primary image must be less than 5MB");
        return;
      }

      setPrimaryImage(file);
      console.log(
        `Selected primary image: ${file.name} (${file.type}, ${file.size} bytes)`
      );

      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAdditionalImages(files);

      // Create previews for all additional images
      const previews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setAdditionalPreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create product data object with proper number conversions
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        stockQuantity: Number.parseInt(formData.stockQuantity, 10),
        categoryId: Number.parseInt(formData.categoryId, 10),
      };

      console.log("Submitting product data:", productData);

      if (isEditing) {
        // Handle update case
        await ProductService.updateProduct(Number(id), productData);
        showNotification("success", "Product updated successfully");
        navigate(`/trang-chu/nguoi-dung/san-pham`, {
          state: { message: "Product updated successfully" },
        });
      } else {
        // Create new product
        const response = await ProductService.createProduct(
          productData,
          primaryImage,
          additionalImages
        );

        showNotification("success", "Product created successfully");
        navigate(`/trang-chu/nguoi-dung/san-pham`, {
          state: {
            message:
              "Product created successfully. It will be reviewed by an admin.",
          },
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} product`;
      setError(errorMessage);
      console.error(err);
      showNotification("error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li className="flex items-center">
            <Link
              to="/trang-chu"
              className="hover:text-primary-600 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link
              to="/trang-chu/nguoi-dung/san-pham"
              className="hover:text-primary-600"
            >
              Sản phẩm của bạn
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-500">Thêm sản phẩm của bạn</li>
        </ol>
      </nav>
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {isEditing ? "Chỉnh sửa sản phẩm" : "Tạo mới sản phẩm cho bạn"}
          </h1>
          <Link
            to="/trang-chu/nguoi-dung/san-pham"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Trở về trang sản phẩm
          </Link>
        </div>
      </div>

      <div className="p-6">
        {!isEditing && (
          <div className="flex items-start p-4 mb-6 rounded-lg bg-blue-50 border border-blue-200">
            <Info className="text-blue-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-blue-700">
              Sản phẩm bạn thêm sẽ được duyệt bởi quản trị viên!
            </p>
          </div>
        )}

        {notification.show && (
          <div
            className={`flex items-start p-4 mb-6 rounded-lg ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
            )}
            {notification.message}
          </div>
        )}

        {error && (
          <div className="flex items-start p-4 mb-6 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="text-red-500 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên sản phẩm"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Nhập mô tả sản phẩm"
                 className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="stockQuantity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Số lượng sản phẩm
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Danh mục sản phẩm
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Chọn danh mục sản phẩm</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="flex items-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                    <span className="text-gray-500 text-sm">
                      Loading categories...
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="primaryImage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hình ảnh chính
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="primaryImage"
                    name="primaryImage"
                    accept="image/*"
                    onChange={handlePrimaryImageChange}
                    className="hidden"
                    required={!isEditing}
                  />
                  <label
                    htmlFor="primaryImage"
                    className="flex items-center justify-center w-full px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {primaryImage
                          ? primaryImage.name
                          : "Nhấn vào để thêm ảnh chính"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPEG, PNG, GIF, WEBP (Max 5MB)
                      </span>
                    </div>
                  </label>
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Ảnh chính đã thêm
                    </p>
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "/placeholder.svg?height=128&width=128";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="additionalImages"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hình ảnh bổ sung
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="additionalImages"
                    name="additionalImages"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="additionalImages"
                    className="flex items-center justify-center w-full px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Plus className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {additionalImages.length > 0
                          ? `${additionalImages.length} file(s) selected`
                          : "Nhấn vào để thêm hình ảnh bổ sung"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Optional - Select multiple files
                      </span>
                    </div>
                  </label>
                </div>

                {/* Additional images preview */}
                {additionalPreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Ảnh bổ sung bạn đã thêm
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {additionalPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Additional image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...additionalImages];
                              newImages.splice(index, 1);
                              setAdditionalImages(newImages);

                              const newPreviews = [...additionalPreviews];
                              newPreviews.splice(index, 1);
                              setAdditionalPreviews(newPreviews);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                navigate(
                  isEditing
                    ? `/trang-chu/nguoi-dung/san-pham`
                    : "/trang-chu/nguoi-dung/san-pham"
                )
              }
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Để sau
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Cập nhật sản phẩm"
              ) : (
                "Thêm sản phẩm"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
