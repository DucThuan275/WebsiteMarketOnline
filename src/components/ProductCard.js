"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Info,
  ShieldAlert,
  Package,
  Check,
} from "lucide-react";
import ProductService from "../api/ProductService";
import FavoriteService from "../api/FavoriteService";
import UserService from "../api/UserService";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, preloadedImages = null }) => {
  const [images, setImages] = useState(preloadedImages || []);
  const [isHovering, setIsHovering] = useState(false);
  const [loading, setLoading] = useState(!preloadedImages);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isOwnProduct, setIsOwnProduct] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Use the cart context
  const { addToCart } = useCart();

  // Reference to the add to cart button for animation
  const addToCartButtonRef = useRef(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const [productImages, favoriteStatus, userProfile] = await Promise.all([
          ProductService.getProductImages(Number(product.id)),
          FavoriteService.isProductFavorited(product.id),
          UserService.getCurrentUserProfile(),
        ]);
        setImages(productImages);
        setIsFavorite(favoriteStatus);
        setCurrentUser(userProfile);

        // Check if the current user is the seller of this product
        setIsOwnProduct(userProfile && product.sellerId === userProfile.id);
      } catch (err) {
        console.error("Lỗi tải dữ liệu sản phẩm", err);
      } finally {
        setLoading(false);
      }
    };

    if (product && product.id) {
      fetchProductData();
    }
  }, [product]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (filename) => {
    return filename
      ? `http://localhost:8088/api/v1/product-images/get-image/${filename}`
      : "/placeholder.svg";
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (
      product.stockQuantity <= 0 ||
      isOwnProduct ||
      isAddingToCart ||
      isAddedToCart
    )
      return;

    try {
      setIsAddingToCart(true);

      // Get the cart icon position for animation
      const cartIcon = document.querySelector(".cart-icon");
      if (
        cartIcon &&
        addToCartButtonRef.current &&
        window.addFlyToCartItem &&
        images.length > 0
      ) {
        // Get positions
        const buttonRect = addToCartButtonRef.current.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Calculate start position (center of product image instead of button)
        const productImageEl = addToCartButtonRef.current
          .closest(".group")
          .querySelector("img");
        let startPosition;

        if (productImageEl) {
          const imageRect = productImageEl.getBoundingClientRect();
          startPosition = {
            x: imageRect.left + imageRect.width / 2 - 25, // 25 is half the width of the flying element (50px)
            y: imageRect.top + imageRect.height / 2 - 25,
          };
        } else {
          // Fallback to button position if image not found
          startPosition = {
            x: buttonRect.left + buttonRect.width / 2 - 25,
            y: buttonRect.top - 50, // Start a bit above the button
          };
        }

        // Calculate end position (cart icon)
        const endPosition = {
          x: cartRect.left + cartRect.width / 2 - 25,
          y: cartRect.top + cartRect.height / 2 - 25,
        };

        // Get product image for the animation
        const productImage = getImageUrl(images[0]?.filename);

        // Trigger the fly animation
        window.addFlyToCartItem(productImage, startPosition, endPosition);
      }

      // Use the addToCart function from the context
      const success = await addToCart(product.id, 1);

      if (success) {
        // Show loading state for a short time
        setTimeout(() => {
          setIsAddingToCart(false);
          setIsAddedToCart(true);

          // Show success toast
          showToast("Đã thêm vào giỏ hàng", "success");

          // Reset button state after 3 seconds
          setTimeout(() => {
            setIsAddedToCart(false);
          }, 3000);
        }, 600);
      } else {
        setIsAddingToCart(false);
        showToast("Không thể thêm vào giỏ hàng", "error");
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng", err);
      showToast("Không thể thêm vào giỏ hàng", "error");
      setIsAddingToCart(false);
    }
  };

  // Simple toast function - in a real app, use a toast library or component
  const showToast = (message, type) => {
    // This is a placeholder - implement with your toast system
    console.log(`Toast: ${message} (${type})`);
  };

  const getProductStatus = () => {
    if (product.stockQuantity === 0) {
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

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      if (newFavoriteStatus) {
        await FavoriteService.addFavorite(product.id);
        showToast("Đã thêm vào danh sách yêu thích", "success");
      } else {
        await FavoriteService.removeFavorite(product.id);
        showToast("Đã xóa khỏi danh sách yêu thích", "info");
      }
    } catch (err) {
      setIsFavorite(!isFavorite);
      console.error("Lỗi quản lý sản phẩm yêu thích", err);
      showToast("Không thể cập nhật trạng thái yêu thích", "error");
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const status = getProductStatus();
  const brandName = "VDUCKTIE";

  return (
    <div
      className="group relative h-full flex flex-col bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Brand Tag */}
      <div className="absolute left-0 top-3 z-10">
        <div className="bg-white/90 backdrop-blur-sm py-1 px-3 text-xs font-medium text-stone-700 rounded-r-full shadow-sm">
          {brandName}
        </div>
      </div>

      {/* Image Container */}
      <Link
        to={`/trang-chu/san-pham/chi-tiet-san-pham/${product.id}`}
        className="relative overflow-hidden rounded-t-xl aspect-[3/4]"
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-400 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-100">
              {!imageError && images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(images[0].filename) || "/placeholder.svg"}
                    alt={product.name}
                    onError={handleImageError}
                    className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
                      isHovering
                        ? "scale-110 opacity-0"
                        : "scale-100 opacity-100"
                    }`}
                  />

                  {images.length > 1 && (
                    <img
                      src={
                        getImageUrl(images[1].filename) || "/placeholder.svg"
                      }
                      alt={`${product.name} - Hình khác`}
                      onError={handleImageError}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                        isHovering
                          ? "scale-100 opacity-100"
                          : "scale-95 opacity-0"
                      }`}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-stone-300" />
                </div>
              )}
            </div>

            {/* Status Badge */}
            {status && !isOwnProduct && (
              <div
                className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-white rounded-full shadow-sm flex items-center ${status.color}`}
              >
                {status.icon}
                {status.text}
              </div>
            )}

            {/* Own Product Badge */}
            {isOwnProduct && (
              <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm flex items-center">
                <ShieldAlert className="w-3 h-3 mr-1" />
                Sản phẩm của bạn
              </div>
            )}

            {/* Actions */}
            <div className="absolute bottom-0 right-0 p-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
              <button
                onClick={handleToggleFavorite}
                aria-label={
                  isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
                }
                className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite
                      ? "fill-rose-500 text-rose-500"
                      : "text-stone-600"
                  } 
                  transition-all duration-300 ${
                    isFavorite ? "scale-110" : "scale-100"
                  }`}
                />
              </button>
            </div>
          </>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-4 space-y-2.5">
        {/* Category */}
        <div className="text-xs text-stone-400 font-medium tracking-wider uppercase">
          {product.categoryName || "Chưa phân loại"}
        </div>

        {/* Product Name */}
        <Link
          to={`/trang-chu/san-pham/chi-tiet-san-pham/${product.id}`}
          className="flex-grow"
        >
          <h3
            className="font-medium text-stone-800 line-clamp-2 group-hover:text-stone-950 transition-colors"
            title={product.name}
          >
            {product.name.length > 25
              ? product.name.substring(0, 25) + "..."
              : product.name}
          </h3>
        </Link>

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-1.5">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.price * (1 + product.discount / 100))}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.averageRating ? (
            <div className="flex items-center text-amber-400 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="ml-1 text-xs font-medium text-amber-700">
                {product.averageRating.toFixed(1)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-stone-400 italic">Chưa đánh giá</div>
          )}
        </div>
      </div>

      {/* Add to Cart Button or Own Product Message */}
      <div className="px-3 pb-3 relative z-20">
        {isOwnProduct ? (
          <div className="w-full py-2.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-full flex items-center justify-center border border-blue-100 whitespace-nowrap overflow-hidden px-4">
            <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">Không thể mua sản phẩm của bạn</span>
          </div>
        ) : (
          <button
            ref={addToCartButtonRef}
            onClick={handleAddToCart}
            disabled={
              product.stockQuantity <= 0 || isAddingToCart || isAddedToCart
            }
            className={`w-full py-2.5 text-sm font-medium transition-all duration-300 rounded-full flex items-center justify-center ${
              product.stockQuantity <= 0
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : isAddedToCart
                ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm"
                : "bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:from-stone-800 hover:to-stone-700 shadow-sm hover:shadow transform hover:-translate-y-0.5"
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Đang thêm...
              </>
            ) : isAddedToCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Đã thêm vào giỏ hàng
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stockQuantity <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick View Overlay - Only on the image, not covering the button */}
      <div
        className={`absolute inset-0 bottom-auto pb-[calc(100%-75%)] bg-black/5 backdrop-blur-[2px] flex items-center justify-center opacity-0 
        group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
      >
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-stone-800 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Xem chi tiết
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
