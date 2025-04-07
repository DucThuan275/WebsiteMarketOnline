"use client"

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CartService from "../../../api/CartService";
import { ShoppingCart, Package, User, DollarSign, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const CartDetail = () => {
  const { cartId } = useParams();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch cart details by cartId
    const fetchCartDetail = async () => {
      try {
        setLoading(true);
        const response = await CartService.getCartByUserId(cartId);
        setCart(response);
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin giỏ hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetail();
  }, [cartId]);

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
          <h2 className="text-2xl font-bold text-white">Chi tiết giỏ hàng</h2>
        </div>
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-800/30 p-6 rounded-lg text-center">
            <AlertCircle className="mx-auto h-12 w-12 mb-2 text-red-400" />
            <p className="text-red-300">{error}</p>
            <Link to="/admin/carts" className="mt-4 inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Chi tiết giỏ hàng</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-750 p-8 rounded-lg text-center">
            <ShoppingCart className="mx-auto h-12 w-12 mb-2 text-gray-400" />
            <p className="text-lg text-gray-300">Không tìm thấy thông tin giỏ hàng</p>
            <Link to="/admin/carts" className="mt-4 inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Chi tiết giỏ hàng #{cartId}</h2>
          <Link to="/admin/carts" className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors">
            <ArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-750 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="mr-2 text-pink-500" size={20} />
              Thông tin người dùng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 w-32">ID người dùng:</span>
                <span className="text-white">{cart.userId}</span>
              </div>
              {cart.userEmail && (
                <div className="flex items-center">
                  <span className="text-gray-400 w-32">Email:</span>
                  <span className="text-white">{cart.userEmail}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Ngày tạo:</span>
                <span className="text-white">{new Date(cart.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-750 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ShoppingCart className="mr-2 text-pink-500" size={20} />
              Tổng quan giỏ hàng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Tổng sản phẩm:</span>
                <span className="text-white">{cart.totalItems} sản phẩm</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Tổng tiền:</span>
                <span className="text-pink-400 font-medium">{formatCurrency(cart.totalAmount)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-32">Trạng thái:</span>
                <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">
                  Chưa thanh toán
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-750 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Package className="mr-2 text-pink-500" size={20} />
            Danh sách sản phẩm
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {cart.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.productName}
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/600x400/EEE/31343C";
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{item.productName}</div>
                          {item.productVariant && (
                            <div className="text-xs text-gray-400">{item.productVariant}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatCurrency(item.productPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-pink-400 font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-700/50">
                  <td colSpan="3" className="px-6 py-4 text-right font-medium text-white">
                    Tổng cộng:
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-pink-400">
                    {formatCurrency(cart.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetail;
