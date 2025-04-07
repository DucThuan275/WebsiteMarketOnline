"use client";

import { useState } from "react";
import { ExternalLink, Star, Heart, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Giả lập trạng thái sản phẩm
  const getProductStatus = () => {
    if (product.stock === 0) {
      return {
        text: "Hết hàng",
        color: "bg-stone-500",
        icon: <Package className="w-3 h-3 mr-1" />,
      };
    }
    if (product.discount > 0) {
      return {
        text: `- ${product.discount}%`,
        color: "bg-gradient-to-r from-rose-500 to-rose-400",
        icon: null,
      };
    }
    if (product.isHot) {
      return {
        text: "Bán chạy",
        color: "bg-gradient-to-r from-amber-500 to-amber-400",
        icon: <Star className="w-3 h-3 mr-1 fill-white" />,
      };
    }
    return null;
  };

  const status = getProductStatus();

  return (
    <div className="flex bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 mb-2">
      {/* Ảnh sản phẩm */}
      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50">
        <img
          className="h-50 w-50 object-cover"
          src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400/EEE/31343C";
          }}
        />

        {/* Status Badge */}
        {status && (
          <div
            className={`absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium text-white rounded-sm shadow-sm flex items-center ${status.color}`}
          >
            {status.icon}
            {status.text}
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
        <div>
          <h3
            className="font-medium text-sm text-gray-800 line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="flex items-center mt-1 space-x-2">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>

            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price * 1.2)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-gray-500">
            Còn {product.stockQuantity || 0} sản phẩm
          </div>

          {product.rating && (
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="ml-0.5 text-xs font-medium text-amber-700">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Các nút tương tác */}
      <div className="w-10 flex flex-col border-l border-gray-100">
        <button
          onClick={handleToggleFavorite}
          className="flex-1 flex items-center justify-center hover:bg-gray-50"
          title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-400"
            }`}
          />
        </button>

        <Link
          to={`/trang-chu/san-pham/chi-tiet-san-pham/${product.id}`}
          className="flex-1 flex items-center justify-center hover:bg-gray-50 border-t border-gray-100"
          title="Xem chi tiết"
        >
          <ExternalLink className="w-4 h-4 text-blue-500" />
        </Link>
      </div>
    </div>
  );
}
