"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import OrderService from "../../../api/OrderService"
import UserService from "../../../api/UserService"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Package,
  FileText,
  Clock,
  FileDown,
  Printer,
} from "lucide-react"
import * as XLSX from "xlsx"

const OrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newStatus, setNewStatus] = useState("")
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState(null)
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)

  // Fetch order details and user information
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const orderData = await OrderService.getOrderById(Number(orderId))
        setOrder(orderData)
        setNewStatus(orderData.status)

        // Fetch user information if userId is available
        if (orderData.userId) {
          const userData = await UserService.getUserById(orderData.userId)
          setUser(userData)
        }
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng hoặc người dùng")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const handleStatusChange = async () => {
    try {
      setStatusUpdateLoading(true)
      setStatusUpdateError(null)
      setStatusUpdateSuccess(false)

      // Call API to update order status
      await OrderService.updateOrderStatus(Number(orderId), { status: newStatus })

      // Update UI on success
      setOrder({ ...order, status: newStatus })
      setStatusUpdateSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess(false)
      }, 3000)
    } catch (err) {
      setStatusUpdateError("Cập nhật trạng thái thất bại: " + (err.message || "Lỗi không xác định"))
      console.error(err)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Cancel order
  const handleCancelOrder = async () => {
    try {
      setStatusUpdateLoading(true)
      await OrderService.cancelOrder(Number(orderId))
      setOrder({ ...order, status: "CANCELLED" })
      setNewStatus("CANCELLED")
      setShowCancelConfirm(false)
      setStatusUpdateSuccess(true)
      setTimeout(() => {
        setStatusUpdateSuccess(false)
      }, 3000)
    } catch (err) {
      setStatusUpdateError("Hủy đơn hàng thất bại")
      console.error(err)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Delete order
  const handleDeleteOrder = async () => {
    try {
      await OrderService.deleteOrder(Number(orderId))
      navigate("/admin/orders", {
        state: { message: "Đơn hàng đã được xóa thành công" },
      })
    } catch (err) {
      setError("Xóa đơn hàng thất bại")
      console.error(err)
      setShowDeleteConfirm(false)
    }
  }

  // Export order to Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true)

      // Create order data for Excel
      const orderData = {
        "Mã đơn hàng": order.id,
        "Ngày đặt": formatDate(order.createdAt),
        "Trạng thái": getStatusLabel(order.status),
        "Phương thức thanh toán": order.paymentMethod || "N/A",
        "Trạng thái thanh toán": order.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
        "Tên khách hàng": user ? `${user.firstname} ${user.lastname || ""}` : "N/A",
        Email: order.userEmail || "N/A",
        "Số điện thoại": order.contactPhone || "N/A",
        "Địa chỉ giao hàng": order.shippingAddress || "N/A",
        "Tổng giá trị sản phẩm": order.subtotal || order.totalAmount || 0,
        "Phí vận chuyển": order.shippingFee || 0,
        "Giảm giá": order.discount || 0,
        "Tổng thanh toán": order.totalAmount || 0,
        "Ghi chú": order.note || "",
      }

      // Create products data for Excel
      const productsData =
        order.orderDetails?.map((item, index) => ({
          STT: index + 1,
          "Tên sản phẩm": item.productName,
          "Đơn giá (VND)": item.price || 0,
          "Số lượng": item.quantity || 0,
          "Thành tiền (VND)": item.price * item.quantity || 0,
        })) || []

      // Create workbook and worksheets
      const workbook = XLSX.utils.book_new()

      // Order info worksheet
      const orderWorksheet = XLSX.utils.json_to_sheet([orderData])
      XLSX.utils.book_append_sheet(workbook, orderWorksheet, "Thông tin đơn hàng")

      // Set column widths for order info
      const orderColWidths = [
        { wch: 20 }, // Key
        { wch: 40 }, // Value
      ]
      orderWorksheet["!cols"] = orderColWidths

      // Products worksheet
      const productsWorksheet = XLSX.utils.json_to_sheet(productsData)
      XLSX.utils.book_append_sheet(workbook, productsWorksheet, "Sản phẩm")

      // Set column widths for products
      const productsColWidths = [
        { wch: 5 }, // STT
        { wch: 40 }, // Tên sản phẩm
        { wch: 15 }, // Đơn giá
        { wch: 10 }, // Số lượng
        { wch: 15 }, // Thành tiền
      ]
      productsWorksheet["!cols"] = productsColWidths

      // Generate filename
      const fileName = `Don_Hang_${order.id}.xlsx`

      // Write and download file
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error)
    } finally {
      setExportLoading(false)
    }
  }

  // Print invoice
  const printInvoice = () => {
    try {
      setPrintLoading(true)

      // Create a new window for printing
      const printWindow = window.open("", "_blank")

      // Generate HTML content for the invoice
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hóa đơn #${order.id}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #eee;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .invoice-details {
              margin-bottom: 20px;
            }
            .invoice-details-row {
              display: flex;
              margin-bottom: 8px;
            }
            .invoice-details-label {
              width: 150px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background-color: #f8f8f8;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #777;
              font-size: 12px;
            }
            @media print {
              .invoice-container {
                box-shadow: none;
                border: none;
              }
              @page {
                margin: 0.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div>
                <div class="invoice-title">HÓA ĐƠN</div>
                <div>Mã đơn hàng: #${order.id}</div>
                <div>Ngày đặt: ${formatDate(order.createdAt)}</div>
              </div>
              <div>
                <div style="font-weight: bold; font-size: 18px;">VDUCKTIE FASHION</div>
                <div>22/17D Đường Trần Thị Điệu, Quận 9,</div>
                <div>TP. Hồ Chí Minh, Việt Nam</div>
                <div>Email: voducthuan2705@gmail.com</div>
                <div>Điện thoại: +84 (39 232 1224)</div>
              </div>
            </div>
            
            <div class="invoice-details">
              <h3>Thông tin khách hàng</h3>
              <div class="invoice-details-row">
                <div class="invoice-details-label">Tên khách hàng:</div>
                <div>${user ? `${user.firstname} ${user.lastname || ""}` : "N/A"}</div>
              </div>
              <div class="invoice-details-row">
                <div class="invoice-details-label">Email:</div>
                <div>${order.userEmail || "N/A"}</div>
              </div>
              <div class="invoice-details-row">
                <div class="invoice-details-label">Số điện thoại:</div>
                <div>${order.contactPhone || "N/A"}</div>
              </div>
              <div class="invoice-details-row">
                <div class="invoice-details-label">Địa chỉ giao hàng:</div>
                <div>${order.shippingAddress || "N/A"}</div>
              </div>
              <div class="invoice-details-row">
                <div class="invoice-details-label">Phương thức thanh toán:</div>
                <div>${order.paymentMethod || "N/A"}</div>
              </div>
              <div class="invoice-details-row">
                <div class="invoice-details-label">Trạng thái thanh toán:</div>
                <div>${order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</div>
              </div>
            </div>
            
            <h3>Chi tiết đơn hàng</h3>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th class="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${
                  order.orderDetails
                    ?.map(
                      (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.productName}</td>
                    <td>${item.price?.toLocaleString()} ₫</td>
                    <td>${item.quantity}</td>
                    <td class="text-right">${(item.price * item.quantity)?.toLocaleString()} ₫</td>
                  </tr>
                `,
                    )
                    .join("") || ""
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right">Tổng giá trị sản phẩm:</td>
                  <td class="text-right">${(order.subtotal || order.totalAmount)?.toLocaleString()} ₫</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-right">Phí vận chuyển:</td>
                  <td class="text-right">${(order.shippingFee || 0)?.toLocaleString()} ₫</td>
                </tr>
                ${
                  order.discount > 0
                    ? `
                <tr>
                  <td colspan="4" class="text-right">Giảm giá:</td>
                  <td class="text-right">-${order.discount?.toLocaleString()} ₫</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                  <td colspan="4" class="text-right">Tổng thanh toán:</td>
                  <td class="text-right">${order.totalAmount?.toLocaleString()} ₫</td>
                </tr>
              </tfoot>
            </table>
            
            ${
              order.note
                ? `
            <div>
              <h3>Ghi chú</h3>
              <p>${order.note}</p>
            </div>
            `
                : ""
            }
            
            <div class="footer">
              <p>Cảm ơn quý khách đã mua hàng!</p>
              <p>Hóa đơn này được tạo tự động và có giá trị pháp lý.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `

      // Write to the new window and print
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()

      // Handle print completion
      printWindow.onafterprint = () => {
        setPrintLoading(false)
        printWindow.close()
      }

      // In case the print dialog is canceled
      setTimeout(() => {
        setPrintLoading(false)
      }, 5000)
    } catch (error) {
      console.error("Lỗi khi in hóa đơn:", error)
      setPrintLoading(false)
    }
  }

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-900 text-yellow-300"
      case "PROCESSING":
        return "bg-blue-900 text-blue-300"
      case "SHIPPED":
        return "bg-purple-900 text-purple-300"
      case "DELIVERED":
        return "bg-green-900 text-green-300"
      case "RECEIVED":
        return "bg-emerald-900 text-emerald-300"
      case "CANCELLED":
        return "bg-red-900 text-red-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
  }

  // Get status label in Vietnamese
  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận"
      case "PROCESSING":
        return "Đang xử lý"
      case "SHIPPED":
        return "Đã gửi hàng"
      case "DELIVERED":
        return "Đã giao hàng"
      case "RECEIVED":
        return "Đã nhận hàng"
      case "CANCELLED":
        return "Đã hủy"
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="bg-red-900/20 border border-red-800/30 p-6 rounded-lg text-center">
        <XCircle className="mx-auto h-12 w-12 mb-2 text-red-400" />
        <p className="text-red-300">{error}</p>
      </div>
    )

  if (!order)
    return (
      <div className="bg-gray-800 p-8 rounded-lg text-center">
        <AlertTriangle className="mx-auto h-12 w-12 mb-2 text-gray-400" />
        <p className="text-gray-300">Không tìm thấy đơn hàng</p>
      </div>
    )

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Chi tiết đơn hàng <span className="text-pink-500">#{orderId}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportToExcel}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang xuất...
                </>
              ) : (
                <>
                  <FileDown size={16} />
                  Xuất Excel
                </>
              )}
            </button>
            <button
              onClick={printInvoice}
              disabled={printLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {printLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang chuẩn bị...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  In hóa đơn
                </>
              )}
            </button>
            <Link
              to="/admin/orders"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Quay lại
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Xóa đơn hàng
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-750 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Package className="mr-2 text-pink-500" size={20} />
              Thông tin đơn hàng
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Ngày đặt:</span>
                <span className="text-white">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Trạng thái:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Thanh toán:</span>
                <span className="text-white">{order.paymentMethod || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Trạng thái thanh toán:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${order.isPaid ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}
                >
                  {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-750 rounded-lg p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="mr-2 text-pink-500" size={20} />
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Tên khách hàng:</span>
                <span className="text-white">{user ? `${user.firstname} ${user.lastname || ""}` : "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Email:</span>
                <span className="text-white">{order.userEmail || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-400 w-32">Số điện thoại:</span>
                <span className="text-white">{order.contactPhone || "N/A"}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-400 w-32">Địa chỉ giao hàng:</span>
                <span className="text-white">{order.shippingAddress || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-750 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FileText className="mr-2 text-pink-500" size={20} />
            Sản phẩm
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {order.orderDetails?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {item.productImage && (
                          <img
                            src={`http://localhost:8088/api/v1/product-images/get-image/${item.productImage}`}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-md mr-3 bg-gray-700"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "https://placehold.co/600x400/EEE/31343C"
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-white">{item.productName}</p>
                          {item.productDescription && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.productDescription}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{item.price?.toLocaleString()} ₫</td>
                    <td className="px-4 py-4 text-gray-300">{item.quantity}</td>
                    <td className="px-4 py-4 text-pink-400 font-medium">
                      {(item.price * item.quantity)?.toLocaleString()} ₫
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td colSpan="3" className="px-4 py-3 text-right font-medium text-gray-300">
                    Tổng giá trị sản phẩm:
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {order.subtotal?.toLocaleString() || order.totalAmount?.toLocaleString()} ₫
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-medium text-gray-300">
                    Phí vận chuyển:
                  </td>
                  <td className="px-4 py-3 text-white">{order.shippingFee?.toLocaleString() || "0"} ₫</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-medium text-gray-300">
                      Giảm giá:
                    </td>
                    <td className="px-4 py-3 text-red-400">-{order.discount?.toLocaleString()} ₫</td>
                  </tr>
                )}
                <tr className="bg-gray-700/50">
                  <td colSpan="3" className="px-4 py-3 text-right font-bold text-white">
                    Tổng thanh toán:
                  </td>
                  <td className="px-4 py-3 font-bold text-lg text-pink-400">{order.totalAmount?.toLocaleString()} ₫</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {order.note && (
          <div className="bg-gray-750 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center">
              <FileText className="mr-2 text-pink-500" size={20} />
              Ghi chú
            </h2>
            <p className="text-gray-300 whitespace-pre-line">{order.note}</p>
          </div>
        )}

        <div className="bg-gray-750 rounded-lg p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="mr-2 text-pink-500" size={20} />
            Cập nhật trạng thái
          </h2>

          {statusUpdateSuccess && (
            <div className="flex items-center bg-green-900/20 border border-green-800/30 text-green-300 px-4 py-3 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              Cập nhật trạng thái thành công!
            </div>
          )}

          {statusUpdateError && (
            <div className="flex items-center bg-red-900/20 border border-red-800/30 text-red-300 px-4 py-3 rounded-lg mb-4">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              {statusUpdateError}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 flex-1"
              disabled={order.status === "CANCELLED" || order.status === "DELIVERED" || statusUpdateLoading}
            >
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPED">Đã gửi hàng</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>

            <button
              onClick={handleStatusChange}
              disabled={
                statusUpdateLoading ||
                newStatus === order.status ||
                order.status === "CANCELLED" ||
                order.status === "DELIVERED"
              }
              className={`px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center ${
                statusUpdateLoading ||
                newStatus === order.status ||
                order.status === "CANCELLED" ||
                order.status === "DELIVERED"
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {statusUpdateLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật trạng thái"
              )}
            </button>

            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={statusUpdateLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Xác nhận xóa</h3>
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng #{orderId}? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Xóa đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Xác nhận hủy đơn hàng</h3>
            <p className="text-gray-300 mb-6">Bạn có chắc chắn muốn hủy đơn hàng #{orderId}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Không
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail

