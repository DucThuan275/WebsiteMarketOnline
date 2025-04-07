"use client";

import { useState, useEffect } from "react";
import CartService from "../../../api/CartService";
import { Link } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  ChevronLeft,
  Plus,
  Minus,
  ArrowRight,
  Cpu,
  Shield,
  Truck,
  CreditCard,
} from "lucide-react";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [promoCode, setPromoCode] = useState("");

  // Fetch cart data when component mounts
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await CartService.getCurrentUserCart();
        setCart(data);
        setError(null);
      } catch (err) {
        setError("Không thể tải giỏ hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Remove product from cart
  const handleRemoveOneItem = async (itemId) => {
    try {
      setIsRemoving(itemId);
      await CartService.removeItemFromCart(itemId);
      window.location.reload();
      const updatedCart = await CartService.getCurrentUserCart();
      setCart(updatedCart);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng", err);
    } finally {
      setIsRemoving(null);
    }
  };

  // Update quantity
  const handleQuantityChange = async (itemId, quantity) => {
    // If quantity becomes zero, remove the item
    if (quantity === 0) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      setIsUpdating(itemId);
      await CartService.updateCartItem(itemId, quantity);
      const updatedCart = await CartService.getCurrentUserCart();
      setCart(updatedCart);
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm", err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    try {
      setIsRemoving(itemId);
      await CartService.removeCartItem(itemId);
      window.location.reload();
      const updatedCart = await CartService.getCurrentUserCart();
      setCart(updatedCart);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng", err);
    } finally {
      setIsRemoving(null);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?"
      )
    ) {
      try {
        setLoading(true);
        await CartService.clearCart();
        window.location.reload();
        setCart({ items: [], totalAmount: 0 });
      } catch (err) {
        console.error("Lỗi khi xóa giỏ hàng", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <span className="ml-3 text-lg font-medium text-gray-800">
          Đang tải giỏ hàng...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-medium">{error}</p>
          <p className="mt-2">
            Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.
          </p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-cyan-50 rounded-full h-28 w-28 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <ShoppingBag className="h-14 w-14 text-cyan-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Giỏ hàng của bạn đang trống
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Khám phá các sản phẩm công nghệ mới nhất và thêm vào giỏ hàng để
            tiếp tục mua sắm.
          </p>
          <Link
            to="/trang-chu/san-pham"
            className="inline-flex items-center px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              to="/trang-chu"
              className="text-gray-700 hover:text-cyan-600 inline-flex items-center transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <Link
                to="/trang-chu/san-pham"
                className="text-gray-700 hover:text-cyan-600 ml-1 md:ml-2 text-sm font-medium transition-colors"
              >
                Sản phẩm
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span
                className="text-cyan-600 ml-1 md:ml-2 text-sm font-medium"
                aria-current="page"
              >
                Giỏ hàng
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items Section */}
        <div className="lg:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2 text-cyan-600" />
              Giỏ hàng của bạn
            </h1>
            <span className="text-gray-600 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              {cart.items.length} sản phẩm
            </span>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-600">
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Thành tiền</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {cart.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b last:border-0 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Product Info */}
                <div className="col-span-1 md:col-span-5 flex items-center">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-white p-1">
                    <img
                      src={`http://localhost:8088/api/v1/product-images/get-image/${item.productImageUrl}`}
                      alt={item.productName}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>

                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate hover:text-cyan-600 transition-colors">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 flex items-center">
                      <Cpu className="h-3 w-3 mr-1 text-cyan-500" />
                      Mã SP: {item.productId}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-2 md:hidden inline-flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                      disabled={isRemoving === item.id}
                    >
                      {isRemoving === item.id ? (
                        <span className="flex items-center">
                          <div className="animate-spin h-3 w-3 border-b border-red-600 rounded-full mr-1"></div>
                          Đang xóa...
                        </span>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span>Xóa</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 md:col-span-2 text-left md:text-center">
                  <div className="md:hidden text-sm font-medium text-gray-500 mb-1">
                    Đơn giá:
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat().format(item.productPrice)} VND
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-1 md:col-span-2 flex md:justify-center">
                  <div className="md:hidden text-sm font-medium text-gray-500 mb-1 mr-2">
                    Số lượng:
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1 || isUpdating === item.id}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      readOnly
                      className="w-10 text-center border-x border-gray-300 py-1 text-sm bg-white"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={isUpdating === item.id}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {isUpdating === item.id && (
                    <span className="ml-2 text-xs text-gray-500 flex items-center">
                      <div className="animate-spin h-3 w-3 border-b border-gray-600 rounded-full mr-1"></div>
                      Đang cập nhật...
                    </span>
                  )}
                </div>

                {/* Subtotal */}
                <div className="col-span-1 md:col-span-2 text-right md:text-right">
                  <div className="md:hidden text-sm font-medium text-gray-500 mb-1">
                    Thành tiền:
                  </div>
                  <div className="text-sm font-medium text-cyan-700">
                    {new Intl.NumberFormat().format(
                      item.productPrice * item.quantity
                    )}{" "}
                    VND
                  </div>
                </div>

                {/* Actions */}
                <div className="hidden md:flex col-span-1 md:col-span-1 md:justify-end">
                  <button
                    onClick={() => handleRemoveOneItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    disabled={isRemoving === item.id}
                  >
                    {isRemoving === item.id ? (
                      <div className="animate-spin h-5 w-5 border-b border-red-600 rounded-full"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mb-8 flex justify-between">
            <Link
              to="/trang-chu/san-pham"
              className="inline-flex items-center text-cyan-600 hover:text-cyan-800 transition-colors font-medium"
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              <span>Tiếp tục mua sắm</span>
            </Link>

            <button
              onClick={handleClearCart}
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 className="mr-1 h-5 w-5" />
              <span>Xóa giỏ hàng</span>
            </button>
          </div>

          {/* VDUCKTIE Benefits */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-900">
              Ưu đãi khi mua sắm tại VDUCKTIE STORE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <div className="bg-cyan-50 p-2 rounded-lg mr-3">
                  <Truck className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Giao hàng miễn phí
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cho đơn hàng từ 500.000đ
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-cyan-50 p-2 rounded-lg mr-3">
                  <Shield className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Bảo hành chính hãng
                  </h4>
                  <p className="text-sm text-gray-600">
                    Đến 24 tháng tùy sản phẩm
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-cyan-50 p-2 rounded-lg mr-3">
                  <CreditCard className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Thanh toán an toàn
                  </h4>
                  <p className="text-sm text-gray-600">
                    Hỗ trợ nhiều phương thức
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-900 pb-4 border-b">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Tạm tính ({cart.items.length} sản phẩm)
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat().format(cart.totalAmount)} VND
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              {cart.totalAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế (VAT 0%)</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat().format(cart.totalAmount)} VND
                  </span>
                </div>
              )}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-lg text-cyan-700">
                    {new Intl.NumberFormat().format(cart.totalAmount)} VND
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  Đã bao gồm VAT
                </p>
              </div>
            </div>

            <Link to="/trang-chu/gio-hang/thanh-toan">
              <button className="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center font-medium shadow-sm">
                <span>Tiến hành thanh toán</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>

            {/* Promotion Code */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-3 text-gray-900">
                Mã khuyến mãi
              </h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Nhập mã khuyến mãi"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-50"
                />
                <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-r-lg border border-gray-300 border-l-0 hover:bg-gray-200 transition-colors text-sm font-medium">
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
