"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import OrderService from "../../../api/OrderService"
import ReviewService from "../../../api/ReviewService"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  FileSpreadsheet,
  Star,
} from "lucide-react"

const OrderDetails = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [newStatus, setNewStatus] = useState(null)
  const [expandedSection, setExpandedSection] = useState("items")
  const [productReviews, setProductReviews] = useState({})
  const [showReviewForm, setShowReviewForm] = useState({})
  const [newReview, setNewReview] = useState({
    productId: null,
    rating: 5,
    comment: "",
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const orderData = await OrderService.getOrderById(orderId)

        // Add a safeguard to ensure items is an array
        if (!orderData.items) {
          orderData.items = []
        }

        setOrder(orderData)
        setError(null)

        // Check if products have been reviewed
        if (orderData.orderDetails && orderData.orderDetails.length > 0) {
          const reviewsData = {}

          // Initialize review states for each product
          orderData.orderDetails.forEach((item) => {
            reviewsData[item.productId] = null
            setShowReviewForm((prev) => ({
              ...prev,
              [item.productId]: false,
            }))
          })

          setProductReviews(reviewsData)

          // Fetch existing reviews for each product
          fetchProductReviews(orderData.orderDetails)
        }
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.")
        console.error("Error fetching order details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  // Fetch reviews for products in the order
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
      console.error("Error fetching product reviews:", err)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (status) => {
    setNewStatus(status)
    setShowConfirmation(true)
  }

  // Confirm status update
  const confirmStatusUpdate = async () => {
    try {
      setStatusUpdateLoading(true)
      await OrderService.updateOrderStatus(orderId, { status: newStatus })

      // Update local order data
      setOrder({ ...order, status: newStatus })
      setShowConfirmation(false)
      setShowStatusOptions(false)
    } catch (err) {
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.")
      console.error("Error updating order status:", err)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Cancel order
  const handleCancelOrder = async () => {
    try {
      setStatusUpdateLoading(true)
      await OrderService.cancelOrder(orderId)

      // Update local order data
      setOrder({ ...order, status: "CANCELLED" })
      setShowConfirmation(false)
      setShowStatusOptions(false)
    } catch (err) {
      setError("Không thể hủy đơn hàng. Vui lòng thử lại sau.")
      console.error("Error cancelling order:", err)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Toggle section expansion
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Toggle review form for a product
  const toggleReviewForm = (productId) => {
    setShowReviewForm((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))

    // Initialize new review state
    setNewReview({
      productId,
      rating: 5,
      comment: "",
    })

    // Clear any previous errors
    setReviewError(null)
  }

  // Handle rating change
  const handleRatingChange = (rating) => {
    setNewReview((prev) => ({
      ...prev,
      rating,
    }))
  }

  // Handle comment change
  const handleCommentChange = (e) => {
    setNewReview((prev) => ({
      ...prev,
      comment: e.target.value,
    }))
  }

  // Submit product review
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    setReviewError(null)

    try {
      const reviewData = {
        productId: newReview.productId,
        rating: newReview.rating,
        comment: newReview.comment,
      }

      const response = await ReviewService.createReview(reviewData)

      // Update the reviews state with the new review
      setProductReviews((prev) => ({
        ...prev,
        [newReview.productId]: response,
      }))

      // Close the review form
      setShowReviewForm((prev) => ({
        ...prev,
        [newReview.productId]: false,
      }))

      // Show success message
      alert("Đánh giá của bạn đã được gửi thành công!")
    } catch (err) {
      console.error("Error submitting review:", err)
      setReviewError("Không thể gửi đánh giá. Vui lòng thử lại sau.")
    } finally {
      setSubmittingReview(false)
    }
  }

  // Render star rating
  const renderStarRating = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${index < rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`}
        />
      ))
  }

  // Render rating input
  const renderRatingInput = () => {
    return (
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => handleRatingChange(star)} className="focus:outline-none">
            <Star
              className={`w-6 h-6 ${star <= newReview.rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`}
            />
          </button>
        ))}
      </div>
    )
  }

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-4 h-4 mr-1" />,
      },
      PROCESSING: {
        color: "bg-blue-100 text-blue-800",
        icon: <RefreshCw className="w-4 h-4 mr-1" />,
      },
      SHIPPED: {
        color: "bg-indigo-100 text-indigo-800",
        icon: <Truck className="w-4 h-4 mr-1" />,
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800",
        icon: <Package className="w-4 h-4 mr-1" />,
      },
      RECEIVED: {
        color: "bg-emerald-100 text-emerald-800",
        icon: <CheckCircle className="w-4 h-4 mr-1" />,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4 mr-1" />,
      },
      RETURNED: {
        color: "bg-orange-100 text-orange-800",
        icon: <RefreshCw className="w-4 h-4 mr-1" />,
      },
    }

    const statusInfo = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: null,
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.icon}
        {status}
      </span>
    )
  }

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("vi-VN", options)
  }

  // Check if user can review a product
  const canReviewProduct = (productId) => {
    // Only allow reviews if order is DELIVERED or RECEIVED
    return ["DELIVERED", "RECEIVED"].includes(order.status) && !productReviews[productId]
  }

  // Print invoice
  const printInvoice = () => {
    const printWindow = window.open("", "_blank")

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn #${order.id}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
          }
          .order-info {
            margin-bottom: 20px;
          }
          .customer-info {
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .total-row {
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN BÁN HÀNG</h1>
          <p>Mã đơn hàng: #${order.id}</p>
          <p>Ngày đặt hàng: ${formatDate(order.createdAt)}</p>
        </div>
        
        <div class="order-info">
          <h2>Thông tin đơn hàng</h2>
          <p><strong>Trạng thái:</strong> ${order.status}</p>
          <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
        </div>
        
        <div class="customer-info">
          <h2>Thông tin khách hàng</h2>
          <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress}</p>
          <p><strong>Số điện thoại:</strong> ${order.contactPhone}</p>
          ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ""}
          ${order.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ""}
        </div>
        
        <h2>Chi tiết sản phẩm</h2>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Mã SP</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${
              order.orderDetails &&
              order.orderDetails
                .map(
                  (item) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.productId}</td>
                <td>${item.quantity}</td>
                <td>${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.price)}</td>
                <td>${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.price * item.quantity)}</td>
              </tr>
            `,
                )
                .join("")
            }
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" align="right"><strong>Tạm tính:</strong></td>
              <td>${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.subtotal || order.totalAmount)}</td>
            </tr>
            <tr>
              <td colspan="4" align="right"><strong>Phí vận chuyển:</strong></td>
              <td>${
                order.shippingFee
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.shippingFee)
                  : "Miễn phí"
              }</td>
            </tr>
            ${
              order.discount > 0
                ? `
            <tr>
              <td colspan="4" align="right"><strong>Giảm giá:</strong></td>
              <td>-${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.discount)}</td>
            </tr>
            `
                : ""
            }
            ${
              order.tax > 0
                ? `
            <tr>
              <td colspan="4" align="right"><strong>Thuế:</strong></td>
              <td>${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.tax)}</td>
            </tr>
            `
                : ""
            }
            <tr class="total-row">
              <td colspan="4" align="right"><strong>Tổng cộng:</strong></td>
              <td>${new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>Cảm ơn quý khách đã mua hàng!</p>
          <p>Ngày in: ${new Date().toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Add headers
    csvContent +=
      "Mã đơn hàng,Ngày đặt hàng,Trạng thái,Phương thức thanh toán,Địa chỉ giao hàng,Số điện thoại,Email,Ghi chú\n"

    // Add order info
    csvContent += `${order.id},${new Date(order.createdAt).toLocaleDateString()},${order.status},${
      order.paymentMethod
    },${order.shippingAddress.replace(/,/g, " ")},${order.contactPhone},${
      order.email || ""
    },${(order.notes || "").replace(/,/g, " ")}\n\n`

    // Add product headers
    csvContent += "Sản phẩm,Mã SP,Số lượng,Đơn giá,Thành tiền\n"

    // Add product details
    if (order.orderDetails && order.orderDetails.length > 0) {
      order.orderDetails.forEach((item) => {
        csvContent += `${item.productName.replace(/,/g, " ")},${
          item.productId
        },${item.quantity},${item.price},${item.price * item.quantity}\n`
      })
    }

    // Add summary
    csvContent += `\nTạm tính,,,,${order.subtotal || order.totalAmount}\n`
    csvContent += `Phí vận chuyển,,,,${order.shippingFee || 0}\n`
    if (order.discount > 0) {
      csvContent += `Giảm giá,,,,-${order.discount}\n`
    }
    if (order.tax > 0) {
      csvContent += `Thuế,,,,${order.tax}\n`
    }
    csvContent += `Tổng cộng,,,,${order.totalAmount}\n`

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `DonHang_${order.id}.csv`)
    document.body.appendChild(link)

    // Trigger download
    link.click()

    // Clean up
    document.body.removeChild(link)
  }

  // Check if user can change status
  const canChangeStatus = (currentStatus) => {
    // Only allow status changes if not already in one of these statuses
    return !["CANCELLED", "RETURNED", "RECEIVED"].includes(currentStatus)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg">Đang tải thông tin đơn hàng...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center text-red-700 hover:text-red-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Không tìm thấy thông tin đơn hàng.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center text-yellow-700 hover:text-yellow-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link to="/trang-chu" className="text-gray-700 hover:text-gray-900 inline-flex items-center">
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
                to="/trang-chu/nguoi-dung/thong-tin-nguoi-dung"
                className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2 text-sm font-medium"
              >
                Người dùng
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
              <Link
                to="/trang-chu/nguoi-dung/don-hang-cua-ban"
                className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2 text-sm font-medium"
              >
                Đơn hàng của bạn
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
              <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium" aria-current="page">
                Chi tiết đơn hàng #{order.id}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Đơn hàng #{order.id}</h1>
            <p className="text-gray-600 mt-1">Đặt hàng ngày {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-4 md:mt-0">{getStatusBadge(order.status)}</div>
        </div>

        {/* Status Update Options */}
        {canChangeStatus(order.status) && (
          <div className="mt-6 relative">
            <button
              onClick={() => setShowStatusOptions(!showStatusOptions)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cập nhật trạng thái
              {showStatusOptions ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </button>

            {showStatusOptions && (
              <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => handleStatusUpdate("RECEIVED")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <CheckCircle className="inline-block w-4 h-4 mr-2 text-green-600" />
                    Đã nhận hàng
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("RETURNED")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <RefreshCw className="inline-block w-4 h-4 mr-2 text-orange-600" />
                    Trả hàng
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <XCircle className="inline-block w-4 h-4 mr-2 text-red-600" />
                    Hủy đơn hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận thay đổi trạng thái</h3>
            <p className="text-gray-600 mb-6">
              {newStatus === "CANCELLED"
                ? "Bạn có chắc chắn muốn hủy đơn hàng này không?"
                : `Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng thành "${newStatus}" không?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={statusUpdateLoading}
              >
                Hủy
              </button>
              <button
                onClick={newStatus === "CANCELLED" ? handleCancelOrder : confirmStatusUpdate}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={statusUpdateLoading}
              >
                {statusUpdateLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="px-6 py-4 border-b flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("items")}
            >
              <h2 className="text-lg font-semibold">Sản phẩm đã đặt</h2>
              {expandedSection === "items" ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {expandedSection === "items" && (
              <div className="p-6">
                <div className="space-y-4">
                  {order?.orderDetails && order.orderDetails.length > 0 ? (
                    order.orderDetails.map((item) => (
                      <div key={item.id} className="flex flex-col border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="ml-4 flex-1">
                            <h3 className="text-base font-medium text-gray-900">{item.productName}</h3>
                            <p className="mt-1 text-sm text-gray-500">Mã SP: {item.productId}</p>
                            <div className="mt-1 flex justify-between">
                              <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Product Review Section */}
                        <div className="mt-4 ml-4">
                          {productReviews[item.productId] ? (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center mb-2">
                                <div className="flex mr-2">
                                  {renderStarRating(productReviews[item.productId].rating)}
                                </div>
                                <span className="text-xs text-gray-500">
                                  Đã đánh giá vào {formatDate(productReviews[item.productId].createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{productReviews[item.productId].comment}</p>
                            </div>
                          ) : canReviewProduct(item.productId) ? (
                            <div>
                              {showReviewForm[item.productId] ? (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  {reviewError && <div className="mb-3 text-sm text-red-600">{reviewError}</div>}
                                  <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đánh giá của bạn
                                      </label>
                                      {renderRatingInput()}
                                    </div>
                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét</label>
                                      <textarea
                                        value={newReview.comment}
                                        onChange={handleCommentChange}
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                        rows="3"
                                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                                        required
                                      ></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleReviewForm(item.productId)}
                                        className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                      >
                                        {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              ) : (
                                <button
                                  onClick={() => toggleReviewForm(item.productId)}
                                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                                >
                                  <Star className="w-4 h-4 mr-1" />
                                  Đánh giá sản phẩm
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">Không có sản phẩm trong đơn hàng</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="px-6 py-4 border-b flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("shipping")}
            >
              <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
              {expandedSection === "shipping" ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {expandedSection === "shipping" && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Địa chỉ giao hàng</h3>
                      <p className="text-sm text-gray-600 mt-1">{order.shippingAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Số điện thoại</h3>
                      <p className="text-sm text-gray-600 mt-1">{order.contactPhone}</p>
                    </div>
                  </div>

                  {order.email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Email</h3>
                        <p className="text-sm text-gray-600 mt-1">{order.email}</p>
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">Ghi chú</h3>
                        <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="px-6 py-4 border-b flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("payment")}
            >
              <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>
              {expandedSection === "payment" ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {expandedSection === "payment" && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phương thức thanh toán</span>
                    <span className="text-sm font-medium text-gray-900">{order.paymentMethod}</span>
                  </div>

                  {order.paymentMethod === "VNPAY" && order.paymentDetails && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Chi tiết thanh toán VNPAY</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã giao dịch</span>
                          <span className="font-medium">{order.paymentDetails.transactionId}</span>
                        </div>
                        {order.paymentDetails.bankCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngân hàng</span>
                            <span className="font-medium">{order.paymentDetails.bankCode}</span>
                          </div>
                        )}
                        {order.paymentDetails.payDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngày thanh toán</span>
                            <span className="font-medium">{order.paymentDetails.payDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold mb-4">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.subtotal || order.totalAmount)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>
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
                  <span className="text-red-600">
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
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.tax)}
                  </span>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-4">Trạng thái đơn hàng</h3>
              <div className="space-y-4">
                {order.statusHistory ? (
                  order.statusHistory.map((status, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                        {index < order.statusHistory.length - 1 && <div className="w-0.5 h-full bg-indigo-200"></div>}
                      </div>
                      <div className="flex flex-col pb-4">
                        <span className="text-sm font-medium text-gray-900">{status.status}</span>
                        <span className="text-xs text-gray-500">{formatDate(status.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{order.status}</span>
                      <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link to="/trang-chu/nguoi-dung/don-hang-cua-ban">
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  <span>Quay lại danh sách đơn hàng</span>
                </button>
              </Link>

              {order.status === "DELIVERED" && canChangeStatus(order.status) && (
                <button
                  onClick={() => handleStatusUpdate("RECEIVED")}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  <span>Xác nhận đã nhận hàng</span>
                </button>
              )}

              {canChangeStatus(order.status) && (
                <button
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  <span>Hủy đơn hàng</span>
                </button>
              )}
              <div className="flex items-center justify-between mt-3 gap-4">
                <p className="text-gray-700 text-sm font-medium">Bạn có muốn nhận hóa đơn không?</p>

                <div className="flex gap-3">
                  <button
                    onClick={printInvoice}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors min-w-[120px]"
                  >
                    <Printer className="h-5 w-5" />
                    <span>In hóa đơn</span>
                  </button>

                  <button
                    onClick={exportToExcel}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md hover:bg-emerald-700 transition-colors min-w-[120px]"
                  >
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails

