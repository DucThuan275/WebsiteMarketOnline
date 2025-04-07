"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import ProductService from "../../../api/ProductService";

const DeleteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductById(Number(id));
        setProduct(data);
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update the handleDelete function to handle foreign key constraint errors
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await ProductService.deleteProduct(Number(id));
      navigate("/trang-chu/nguoi-dung/san-pham/", {
        state: { message: "Sản phẩm đã được xóa thành công" },
      });
    } catch (err) {
      console.error("Delete error:", err);
      setDeleting(false);

      // Get the error message from the response
      const errorMessage = err.response?.data?.message || err.message || "";

      // Check for foreign key constraint errors
      if (
        errorMessage.includes("foreign key constraint") ||
        errorMessage.includes("FK1re40cjegsfvw58xrkdp6bac6") ||
        errorMessage.includes("cart_items")
      ) {
        // Extract the specific constraint information
        let constraintTable = "không xác định";

        if (errorMessage.includes("cart_items")) {
          constraintTable = "giỏ hàng";
        } else if (errorMessage.includes("orders")) {
          constraintTable = "đơn hàng";
        } else if (errorMessage.includes("reviews")) {
          constraintTable = "đánh giá";
        }
      } else {
        setError("Không thể xóa sản phẩm");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin"></div>
      </div>
    );

  // Format price with Vietnamese currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (error)
    return (
      <div className="container mx-auto text-center py-12 text-rose-500">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-medium text-stone-800 mb-2">
              Không thể xóa sản phẩm
            </h2>
            <p className="text-stone-600 max-w-md">
              Sản phẩm này không thể xóa vì đang được sử dụng trong hệ thống.
            </p>
          </div>

          <div className="max-w-xl container mx-auto bg-white border border-stone-200 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-4">
              {product.imageUrl ? (
                <img
                  className="h-16 w-16 rounded-md object-cover"
                  src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-stone-100 rounded-md flex items-center justify-center text-stone-400">
                  No image
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-lg font-medium text-stone-800">
                  {product.name}
                </h2>
                <div className="mt-1 text-sm text-stone-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 mr-2">
                    ID: {product.id}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                    {product.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-medium text-stone-800">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-stone-500">
                  Còn {product.stockQuantity} sản phẩm
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-lg mb-8">
            <h3 className="font-medium text-blue-800 mb-2">
              Giải pháp thay thế:
            </h3>
            <ul className="list-disc ml-5 text-blue-700 text-left">
              <li className="mb-2">
                <strong>Ngừng kinh doanh:</strong> Thay vì xóa, bạn có thể cập
                nhật trạng thái sản phẩm thành "Ngừng kinh doanh" hoặc đặt số
                lượng tồn kho về 0.
              </li>
              <li className="mb-2">
                <strong>Ẩn sản phẩm:</strong> Bạn có thể ẩn sản phẩm khỏi cửa
                hàng nhưng vẫn giữ lại trong hệ thống.
              </li>
              <li>
                <strong>Liên hệ quản trị viên:</strong> Nếu bạn thực sự cần xóa
                sản phẩm này, vui lòng liên hệ với quản trị viên để được hỗ trợ.
              </li>
            </ul>
          </div>

          <div className="flex justify-between">
            <Link
              to="/trang-chu/nguoi-dung/san-pham"
              className="inline-flex items-center px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Link>

            <Link
              to={`/trang-chu/nguoi-dung/san-pham/${id}/chinh-sua`}
              className="inline-flex items-center px-6 py-2 bg-stone-800 text-white font-medium rounded-full hover:bg-stone-700 transition-colors"
            >
              Cập nhật sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-12 text-stone-500">
        Không tìm thấy sản phẩm
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
          <li className="text-gray-500">Xóa sản phẩm</li>
        </ol>
      </nav>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h1 className="text-xl font-medium text-stone-800">Xóa sản phẩm</h1>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-lg mb-6">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-stone-800 mb-2">
                Bạn có chắc chắn muốn xóa sản phẩm này?
              </p>
              <p className="text-stone-600 text-sm">
                Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn
                khỏi hệ thống.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-4">
              {product.imageUrl ? (
                <img
                  className="h-16 w-16 rounded-md object-cover"
                  src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-stone-100 rounded-md flex items-center justify-center text-stone-400">
                  No image
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-lg font-medium text-stone-800">
                  {product.name}
                </h2>
                <div className="mt-1 text-sm text-stone-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 mr-2">
                    ID: {product.id}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800">
                    {product.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-medium text-stone-800">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-stone-500">
                  Còn {product.stockQuantity} sản phẩm
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-rose-50 rounded-lg mb-8">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="text-rose-700 font-medium">
              Thao tác này không thể hoàn tác!
            </div>
          </div>

          <div className="flex justify-between">
            <Link
              to="/trang-chu/nguoi-dung/san-pham"
              className="inline-flex items-center px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center px-6 py-2 bg-rose-600 text-white font-medium rounded-full hover:bg-rose-700 transition-colors disabled:bg-stone-300 disabled:text-stone-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Đang xóa..." : "Xác nhận xóa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProduct;
