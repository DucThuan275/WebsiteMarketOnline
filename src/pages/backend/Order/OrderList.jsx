"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import OrderService from "../../../api/OrderService"
import UserService from "../../../api/UserService"
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  User,
  Users,
  List,
  FileDown,
} from "lucide-react"
import * as XLSX from "xlsx"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const OrderList = () => {
  // User state
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Order state
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showFilters, setShowFilters] = useState(false)

  // Export state
  const [exportLoading, setExportLoading] = useState(false)

  // Animation state
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // Refs for scroll animations
  const ordersTableRef = useRef(null)
  const filtersRef = useRef(null)

  // Set page as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const fetchedUsers = await UserService.getAllUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch orders based on filters and selected user
  const fetchOrders = async () => {
    try {
      setLoading(true)
      let fetchedOrders

      // If a user is selected, fetch only their orders
      if (selectedUser) {
        // We need to get all orders for this user, not just a single order
        // getOrderById returns a single order, not an array of user orders
        fetchedOrders = await OrderService.getAllOrder()
        // Filter orders for the selected user
        fetchedOrders = Array.isArray(fetchedOrders)
          ? fetchedOrders.filter((order) => order.userId === selectedUser.id || order.userEmail === selectedUser.email)
          : []
      } else {
        // Otherwise fetch orders based on filters
        if (statusFilter && statusFilter !== "all") {
          fetchedOrders = await OrderService.getOrdersByStatus(statusFilter)
        } else if (dateRange.startDate && dateRange.endDate) {
          fetchedOrders = await OrderService.getOrdersByDateRange(dateRange.startDate, dateRange.endDate)
        } else {
          fetchedOrders = await OrderService.getAllOrder()
        }
      }

      // Ensure orders is always an array
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : [])
      setError(null)
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch orders when filters or selected user changes
  useEffect(() => {
    fetchOrders()
  }, [statusFilter, selectedUser])

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setCurrentPage(1) // Reset to first page when changing user
  }

  // Clear user selection
  const handleClearUserSelection = () => {
    setSelectedUser(null)
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
  }

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    })
  }

  const handleDateRangeSubmit = (e) => {
    e.preventDefault()
    fetchOrders()
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleUserSearch = (e) => {
    setUserSearchTerm(e.target.value)
  }

  const handleRefresh = () => {
    setStatusFilter("all")
    setDateRange({ startDate: "", endDate: "" })
    setSearchTerm("")
    fetchOrders()
  }

  // Export orders to Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true)

      // Get all orders for export (might need to fetch more if there's pagination on the server)
      let ordersToExport = filteredOrders

      // If we're only showing a subset of orders due to pagination, we might want to fetch all orders
      // that match the current filters for a complete export
      if (filteredOrders.length > 0 && filteredOrders.length < orders.length) {
        // We're already using the filtered orders based on search term
        ordersToExport = orders.filter(
          (order) =>
            order.id.toString().includes(searchTerm) ||
            (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }

      // Map orders to a format suitable for Excel
      const mappedOrders = ordersToExport.map((order) => ({
        "Mã đơn hàng": order.id,
        "Ngày đặt": formatDate(order.createdAt),
        "Email khách hàng": order.userEmail || "N/A",
        "Tổng tiền (VND)": order.totalAmount || 0,
        "Trạng thái": getStatusLabel(order.status),
        "Phương thức thanh toán": order.paymentMethod || "N/A",
        "Đã thanh toán": order.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
        "Địa chỉ giao hàng": order.shippingAddress || "N/A",
        "Số điện thoại": order.contactPhone || "N/A",
        "Ghi chú": order.note || "",
      }))

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(mappedOrders)

      // Set column widths
      const columnWidths = [
        { wch: 10 }, // Mã đơn hàng
        { wch: 20 }, // Ngày đặt
        { wch: 30 }, // Email khách hàng
        { wch: 15 }, // Tổng tiền
        { wch: 15 }, // Trạng thái
        { wch: 20 }, // Phương thức thanh toán
        { wch: 15 }, // Đã thanh toán
        { wch: 40 }, // Địa chỉ giao hàng
        { wch: 15 }, // Số điện thoại
        { wch: 30 }, // Ghi chú
      ]
      worksheet["!cols"] = columnWidths

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hàng")

      // Generate filename
      const fileName = selectedUser
        ? `Don_Hang_${selectedUser.firstname}_${selectedUser.lastname}.xlsx`
        : statusFilter !== "all"
          ? `Don_Hang_${getStatusLabel(statusFilter)}.xlsx`
          : "Danh_Sach_Don_Hang.xlsx"

      // Write and download file
      XLSX.writeFile(workbook, fileName)
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error)
      setError("Không thể xuất file Excel. Vui lòng thử lại sau.")
    } finally {
      setExportLoading(false)
    }
  }

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

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchTerm) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.firstname && user.firstname.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (user.lastname && user.lastname.toLowerCase().includes(userSearchTerm.toLowerCase())),
  )

  // Pagination
  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

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

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* User List Panel */}
      <motion.div
        className="w-full md:w-1/4 bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={fadeInLeft}
      >
        <motion.div className="p-4 border-b border-gray-700" variants={fadeInUp}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} />
            Danh sách người dùng
          </h2>
          <div className="mt-3 relative">
            <input
              type="text"
              value={userSearchTerm}
              onChange={handleUserSearch}
              placeholder="Tìm kiếm người dùng..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </motion.div>

        {/* Show All Option */}
        <motion.div className="border-b border-gray-700" variants={fadeInUp}>
          <button
            onClick={handleClearUserSelection}
            className={`w-full text-left p-4 hover:bg-gray-700 transition-colors flex items-center gap-3 ${
              selectedUser === null ? "bg-gray-700" : ""
            }`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">
              <List className="text-white" size={20} />
            </div>
            <div>
              <p className="font-medium text-white">Hiển thị tất cả</p>
              <p className="text-sm text-gray-400">Tất cả đơn hàng</p>
            </div>
          </button>
        </motion.div>

        {loadingUsers ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <motion.div className="overflow-y-auto max-h-[calc(100vh-250px)]" variants={staggerContainer}>
            {filteredUsers.length === 0 ? (
              <motion.div className="p-4 text-center text-gray-400" variants={fadeInUp}>
                Không tìm thấy người dùng nào
              </motion.div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <motion.li key={user.id} variants={fadeInUp} custom={index}>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className={`w-full text-left p-4 hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                        selectedUser?.id === user.id ? "bg-gray-700" : ""
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="text-gray-300" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {user.firstname} {user.lastname}
                        </p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Orders Panel */}
      <motion.div
        className="w-full md:w-3/4 bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={fadeInRight}
      >
        <motion.div className="p-6 border-b border-gray-700" variants={fadeInUp}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              {selectedUser ? (
                <>
                  <button
                    onClick={handleClearUserSelection}
                    className="p-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-white transition-colors"
                    title="Quay lại tất cả đơn hàng"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  Đơn hàng của {selectedUser.firstname} {selectedUser.lastname}
                </>
              ) : (
                "Quản lý đơn hàng"
              )}
            </h1>
            <div className="flex items-center gap-2">
              {filteredOrders.length > 0 && (
                <button
                  onClick={exportToExcel}
                  disabled={exportLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
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
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Filter size={16} />
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Làm mới"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="p-6 border-b border-gray-700"
              ref={filtersRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div className="space-y-2" variants={fadeInUp} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-gray-300">Lọc theo trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="all">Tất cả đơn hàng</option>
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="SHIPPED">Đã gửi hàng</option>
                    <option value="DELIVERED">Đã giao hàng</option>
                    <option value="RECEIVED">Đã nhận hàng</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </motion.div>

                <motion.div
                  className="space-y-2"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-300">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder="Tìm theo mã đơn hàng, email..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </motion.div>

                <motion.form
                  onSubmit={handleDateRangeSubmit}
                  className="space-y-2"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-300">Khoảng thời gian</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="date"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateRangeChange}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateRangeChange}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Áp dụng
                  </button>
                </motion.form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <motion.div className="p-6 text-center" variants={fadeInUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 text-red-400 mb-4">
              <AlertCircle size={32} />
            </div>
            <p className="text-lg text-red-400">{error}</p>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div className="p-6 text-center" variants={fadeInUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <AlertCircle size={32} />
            </div>
            <p className="text-lg text-gray-300">
              {selectedUser
                ? `Không tìm thấy đơn hàng nào của ${selectedUser.firstname} ${selectedUser.lastname}`
                : "Không tìm thấy đơn hàng nào"}
            </p>
            <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="overflow-x-auto"
              ref={ordersTableRef}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <motion.tbody className="bg-gray-800 divide-y divide-gray-700" variants={staggerContainer}>
                  {currentOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      className="hover:bg-gray-750 transition-colors"
                      variants={fadeInUp}
                      custom={index}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-pink-400 font-medium">{order.totalAmount?.toLocaleString()} ₫</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                            title="Chi tiết"
                          >
                            <Eye size={16} />
                            <span className="sr-only">Chi tiết</span>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <div className="text-sm text-gray-400">
                  Hiển thị {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} của{" "}
                  {filteredOrders.length} đơn hàng
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div className="flex items-center">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                      const pageNum = index + Math.max(1, Math.min(currentPage - 2, totalPages - 4))
                      if (pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`w-8 h-8 rounded-md ${
                              pageNum === currentPage
                                ? "bg-pink-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

export default OrderList

