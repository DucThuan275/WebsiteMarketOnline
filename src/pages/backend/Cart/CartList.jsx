"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import CartService from "../../../api/CartService"
import { ShoppingCart, Eye, Search, RefreshCw, Calendar, User, AlertCircle } from "lucide-react"

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

const CartList = () => {
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" })

  useEffect(() => {
    fetchCarts()
  }, [])

  const fetchCarts = async () => {
    try {
      setLoading(true)
      const response = await CartService.getAllcarts()
      setCarts(response)
      setError(null)
    } catch (err) {
      setError("Không thể tải danh sách giỏ hàng")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target
    setDateFilter((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Filter carts based on search term and date range
  const filteredCarts = carts.filter((cart) => {
    // Search filter
    const matchesSearch =
      cart.userId.toString().includes(searchTerm) ||
      (cart.userEmail && cart.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))

    // Date filter
    let matchesDate = true
    if (dateFilter.startDate && dateFilter.endDate) {
      const cartDate = new Date(cart.createdAt || Date.now())
      const startDate = new Date(dateFilter.startDate)
      const endDate = new Date(dateFilter.endDate)
      endDate.setHours(23, 59, 59, 999) // End of the day

      matchesDate = cartDate >= startDate && cartDate <= endDate
    }

    return matchesSearch && matchesDate
  })

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Giỏ hàng bị bỏ quên</h2>
          <button
            onClick={fetchCarts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Tìm kiếm theo ID người dùng hoặc email..."
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={dateFilter.startDate}
                onChange={handleDateFilterChange}
                className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={dateFilter.endDate}
                onChange={handleDateFilterChange}
                className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : filteredCarts.length === 0 ? (
          <div className="bg-gray-750 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <ShoppingCart size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">Không tìm thấy giỏ hàng nào</p>
            <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">#{cart.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                          <User size={16} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">ID: {cart.userId}</div>
                          {cart.userEmail && <div className="text-xs text-gray-400">{cart.userEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(cart.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-300">
                        {cart.totalItems} sản phẩm
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-pink-400 font-medium">
                      {formatCurrency(cart.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/carts/${cart.id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-md transition-colors"
                      >
                        <Eye size={16} className="mr-1" />
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartList

