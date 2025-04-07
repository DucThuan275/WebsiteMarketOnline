import React from "react";
import { Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductComparison({ products }) {
  if (!products || products.length < 2) {
    return (
      <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>Cần ít nhất 2 sản phẩm để so sánh</span>
        </div>
      </div>
    );
  }

  // Lấy 2 sản phẩm đầu tiên để so sánh
  const [product1, product2] = products.slice(0, 2);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Xác định sản phẩm nào tốt hơn trong từng tiêu chí
  const getBetterProduct = {
    price:
      product1.price < product2.price
        ? 1
        : product1.price > product2.price
        ? 2
        : 0,
    stockQuantity:
      product1.stockQuantity > product2.stockQuantity
        ? 1
        : product1.stockQuantity < product2.stockQuantity
        ? 2
        : 0,
    rating:
      (product1.rating || 0) > (product2.rating || 0)
        ? 1
        : (product1.rating || 0) < (product2.rating || 0)
        ? 2
        : 0,
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">So sánh sản phẩm</h3>
      </div>

      {/* Hình ảnh sản phẩm */}
      <div className="grid grid-cols-2 gap-2 p-3 border-b border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mb-2">
            <img
              className="h-50 w-50 object-cover"
              src={`http://localhost:8088/api/v1/product-images/get-image/${product1.imageUrl}`}
              alt={product1.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400/EEE/31343C";
              }}
            />
          </div>
          <h4 className="text-xs font-medium text-center line-clamp-2">
            {product1.name}
          </h4>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mb-2">
            <img
              className="h-50 w-50 object-cover"
              src={`http://localhost:8088/api/v1/product-images/get-image/${product2.imageUrl}`}
              alt={product2.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400/EEE/31343C";
              }}
            />
          </div>
          <h4 className="text-xs font-medium text-center line-clamp-2">
            {product2.name}
          </h4>
        </div>
      </div>

      {/* Bảng so sánh */}
      <div className="divide-y divide-gray-200">
        {/* Giá */}
        <div className="grid grid-cols-2 text-sm">
          <div
            className={`p-3 ${
              getBetterProduct.price === 1 ? "bg-green-50" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Giá</div>
            <div className="font-medium flex items-center">
              {formatPrice(product1.price)}
              {getBetterProduct.price === 1 && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
          <div
            className={`p-3 ${
              getBetterProduct.price === 2 ? "bg-green-50" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Giá</div>
            <div className="font-medium flex items-center">
              {formatPrice(product2.price)}
              {getBetterProduct.price === 2 && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
        </div>

        {/* Danh mục */}
        <div className="grid grid-cols-2 text-sm">
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-1">Danh mục</div>
            <div className="font-medium">
              {product1.category?.name || "Chưa phân loại"}
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-1">Danh mục</div>
            <div className="font-medium">
              {product2.category?.name || "Chưa phân loại"}
            </div>
          </div>
        </div>

        {/* Tồn kho */}
        <div className="grid grid-cols-2 text-sm">
          <div
            className={`p-3 ${
              getBetterProduct.stockQuantity === 1 ? "bg-green-50" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Tồn kho</div>
            <div className="font-medium flex items-center">
              {product1.stockQuantity || 0} sản phẩm
              {getBetterProduct.stockQuantity === 1 && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
          <div
            className={`p-3 ${
              getBetterProduct.stockQuantity === 2 ? "bg-green-50" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Tồn kho</div>
            <div className="font-medium flex items-center">
              {product2.stockQuantity || 0} sản phẩm
              {getBetterProduct.stockQuantity === 2 && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
        </div>

        {/* Đánh giá */}
        <div className="grid grid-cols-2 text-sm">
          <div
            className={`p-3 ${
              getBetterProduct.rating === 1 ? "bg-green-50" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Đánh giá</div>
            <div className="font-medium flex items-center">
              {product1.rating
                ? `${product1.rating.toFixed(1)} ⭐`
                : "Chưa có đánh giá"}
              {getBetterProduct.rating === 1 && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
          <div
            className={`p-3 ${
              getBetterProduct.rating === 2 ? "bg-green-50" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">Đánh giá</div>
            <div className="font-medium flex items-center">
              {product2.rating
                ? `${product2.rating.toFixed(1)} ⭐`
                : "Chưa có đánh giá"}
              {getBetterProduct.rating === 2 && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
          </div>
        </div>

        {/* Thương hiệu */}
        {(product1.brand || product2.brand) && (
          <div className="grid grid-cols-2 text-sm">
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">Thương hiệu</div>
              <div className="font-medium">
                {product1.brand || "Không có thông tin"}
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-500 mb-1">Thương hiệu</div>
              <div className="font-medium">
                {product2.brand || "Không có thông tin"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nút xem chi tiết */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border-t border-gray-200">
        <Link
          to={`/trang-chu/san-pham/chi-tiet-san-pham/${product1.id}`}
          className="text-center py-2 px-3 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          target="_blank"
        >
          Xem chi tiết
        </Link>
        <Link
          to={`/trang-chu/san-pham/chi-tiet-san-pham/${product2.id}`}
          className="text-center py-2 px-3 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          target="_blank"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
