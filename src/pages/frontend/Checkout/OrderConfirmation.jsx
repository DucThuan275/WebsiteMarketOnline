"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle,
  ShoppingBag,
  ArrowRight,
  Cpu,
  Phone,
  Mail,
  Clock,
  Truck,
  Package,
  CheckCheck,
  ChevronRight,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import OrderService from "../../../api/OrderService"
import ReviewService from "../../../api/ReviewService"

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [productReviews, setProductReviews] = useState({})
  const { orderId } = useParams()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const order = await OrderService.getOrderById(orderId)

        if (!order.items) {
          order.items = []
        }

        setOrder(order)

        if (order.orderDetails && order.orderDetails.length > 0) {
          await fetchProductReviews(order.orderDetails)
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const fetchProductReviews = async (orderDetails) => {
    try {
      const reviewPromises = orderDetails.map((item) =>
        ReviewService.getUserReviewForProduct(item.productId)
          .then((review) => ({ productId: item.productId, review }))
          .catch(() => ({ productId: item.productId, review: null })),
      )

      const results = await Promise.all(reviewPromises)

      const reviewsMap = {}
      results.forEach(({ productId, review }) => {
        reviewsMap[productId] = review
      })

      setProductReviews(reviewsMap)
    } catch (err) {
      console.error("Lỗi khi lấy đánh giá sản phẩm:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-emerald-600">VDUCKTIE</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Success banner */}
          <div className="bg-emerald-500 px-6 py-12 text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500" />
                </div>
                <div className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-blue-400"></div>
                <div className="absolute bottom-0 -left-3 h-2 w-2 rounded-full bg-yellow-400"></div>
                <div className="absolute -bottom-2 -right-4 h-4 w-4 rounded-full bg-red-400"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">CẢM ƠN BẠN</h1>
            <p className="text-xl font-medium mb-4">ĐƠN HÀNG CỦA BẠN ĐÃ ĐƯỢC XÁC NHẬN</p>
            <p className="text-emerald-100 max-w-lg mx-auto">
              Chúng tôi sẽ gửi email xác nhận vận chuyển ngay khi đơn hàng được gửi đi
            </p>
          </div>

          {/* Order information */}
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between mb-8">
              <div className="mb-6 md:mb-0">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Đơn hàng #{order.id}</h2>
                <p className="text-sm text-gray-600">Đặt vào ngày {formatDate(order.createdAt)}</p>
              </div>

              <div className="flex items-center">
                <Link
                  to="/don-hang-cua-ban"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
                >
                  Xem chi tiết đơn hàng
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Order tracking */}
            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Tình trạng đơn hàng</h3>

              <div className="relative">
                {/* Progress bar */}
                <div className="absolute top-5 left-7 w-[calc(100%-3.5rem)] h-0.5 bg-gray-200">
                  <div className="h-full bg-emerald-500 w-1/4"></div>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full h-10 w-10 flex items-center justify-center bg-emerald-500 text-white z-10">
                      <CheckCheck className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-900">Đã xác nhận</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-400 z-10">
                      <Clock className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-400">Kiểm tra chất lượng</p>
                    <p className="text-xs text-gray-500">Đang chờ</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-400 z-10">
                      <Truck className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-400">Đang vận chuyển</p>
                    <p className="text-xs text-gray-500">Đang chờ</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="rounded-full h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-400 z-10">
                      <Package className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-400">Đã giao hàng</p>
                    <p className="text-xs text-gray-500">Đang chờ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order details and summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Order details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết đơn hàng</h3>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Sản phẩm
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Giá
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order?.orderDetails && order.orderDetails.length > 0 ? (
                        order.orderDetails.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                  <Cpu className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                  <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                            Không có sản phẩm trong đơn hàng
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order summary */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt đơn hàng</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.subtotal || order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium">
                        {order.shippingFee
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(order.shippingFee)
                          : "Miễn phí"}
                      </span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giảm giá</span>
                        <span className="text-red-600 font-medium">
                          -
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.discount)}
                        </span>
                      </div>
                    )}

                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thuế</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.tax)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Tổng cộng</span>
                        <span className="font-bold text-gray-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer information */}
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h4>
                    <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Địa chỉ thanh toán</h4>
                    <p className="text-sm text-gray-600">{order.billingAddress || order.shippingAddress}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Thông tin liên hệ</h4>
                    <p className="text-sm text-gray-600">{order.email || "customer@example.com"}</p>
                    <p className="text-sm text-gray-600">{order.phone || "+84 123 456 789"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                to="/trang-chu/nguoi-dung/don-hang-cua-ban"
                className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Xem đơn hàng của bạn
              </Link>
              <Link
                to="/trang-chu/san-pham"
                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Tiếp tục mua sắm
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Cần hỗ trợ?</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-gray-600">
              <a href="tel:+84392321224" className="flex items-center hover:text-emerald-600 transition-colors">
                <Phone className="w-5 h-5 mr-2" />
                0392321224
              </a>
              <a
                href="mailto:voducthuan2705@gmail.com"
                className="flex items-center hover:text-emerald-600 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                voducthuan2705@gmail.com
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              © {new Date().getFullYear()} VDUCKTIE. Tất cả các quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default OrderConfirmation