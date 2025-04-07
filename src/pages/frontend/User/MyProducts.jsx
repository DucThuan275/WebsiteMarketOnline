"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  AlertCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Tag,
  Layers,
  ShoppingBag,
} from "lucide-react"
import ProductService from "../../../api/ProductService"
import CategoryService from "../../../api/CategoryService"
import { Link } from "react-router-dom"
import { debounce } from "lodash"

// Add this custom hook after all the imports
const useScrollInView = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  return [ref, isInView]
}

const MyProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState({
    keyword: "",
    categoryId: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
    page: 0,
    size: 10,
    sortField: "id",
    sortDirection: "asc",
  })
  const [totalProducts, setTotalProducts] = useState(0)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setFilters((prev) => ({ ...prev, keyword: searchTerm, page: 0 }))
    }, 500),
    [],
  )

  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.keyword) count++
    if (filters.categoryId) count++
    if (filters.status) count++
    if (filters.minPrice) count++
    if (filters.maxPrice) count++
    if (filters.minStock) count++
    if (filters.maxStock) count++
    setActiveFilters(count)
  }, [filters])

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await ProductService.getMyProducts(
          filters.keyword,
          filters.categoryId,
          filters.status,
          filters.minPrice,
          filters.maxPrice,
          filters.minStock,
          filters.maxStock,
          filters.page,
          filters.size,
          filters.sortField,
          filters.sortDirection,
        )

        setProducts(response.content || [])
        setTotalProducts(response.totalElements || 0)
        setTotalPages(response.totalPages || 0)
      } catch (err) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.")
        console.error("Lỗi tải sản phẩm:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await CategoryService.getActiveCategories()
        const fetchedCategories = Array.isArray(response.data) ? response.data : []
        setCategories(fetchedCategories)
      } catch (err) {
        console.error("Lỗi tải danh mục:", err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value, page: 0 })
  }

  // Handle search input
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage })
    // Scroll to top of product list
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle sort change
  const handleSortChange = (field) => {
    if (filters.sortField === field) {
      // Toggle direction if same field
      setFilters({
        ...filters,
        sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
      })
    } else {
      // Set new field with default asc direction
      setFilters({
        ...filters,
        sortField: field,
        sortDirection: "asc",
      })
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      keyword: "",
      categoryId: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      minStock: "",
      maxStock: "",
      page: 0,
      size: 10,
      sortField: "id",
      sortDirection: "asc",
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-gray-100 text-gray-800"
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  // Get stock level style
  const getStockLevelStyle = (quantity) => {
    if (quantity <= 0) return "text-red-600"
    if (quantity < 10) return "text-amber-600"
    return "text-green-600"
  }

  // Loading State with skeleton
  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-2/4 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="w-24">
                  <div className="h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" /> Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <motion.nav
        className="mb-6"
        aria-label="Breadcrumb"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/trang-chu" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/trang-chu/nguoi-dung" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Người dùng
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-800 font-medium">Sản phẩm của bạn</li>
        </ol>
      </motion.nav>

      {/* Page Header */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white rounded-xl shadow-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Sản phẩm của bạn
            </h1>
            <p className="text-indigo-100 mt-1">
              {totalProducts > 0
                ? `Đang hiển thị ${products.length} trên tổng số ${totalProducts} sản phẩm`
                : "Chưa có sản phẩm nào"}
            </p>
          </div>
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/trang-chu/nguoi-dung/them-san-pham"
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Thêm sản phẩm
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Quick Filters */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative w-full md:w-auto md:flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              defaultValue={filters.keyword}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                activeFilters > 0
                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-5 h-5 mr-2" />
              Bộ lọc
              {activeFilters > 0 && (
                <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm whitespace-nowrap">Sắp xếp theo:</span>
              <select
                value={filters.sortField}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="id">ID</option>
                <option value="name">Tên sản phẩm</option>
                <option value="price">Giá</option>
                <option value="stockQuantity">Tồn kho</option>
                <option value="createdAt">Ngày tạo</option>
              </select>

              <button
                onClick={() => handleSortChange(filters.sortField)}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {filters.sortDirection === "asc" ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                  <option value="PENDING">Chờ duyệt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Từ"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Đến"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minStock"
                    placeholder="Từ"
                    value={filters.minStock}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    name="maxStock"
                    placeholder="Đến"
                    value={filters.maxStock}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Đặt lại bộ lọc
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Product List */}
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {products.length === 0 ? (
          <motion.div
            className="text-center py-16 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Không có sản phẩm nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc hoặc thêm sản phẩm mới.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Đặt lại bộ lọc
              </button>
              <Link
                to="/trang-chu/nguoi-dung/them-san-pham"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Table Header */}
            <motion.div
              className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-right">Giá</div>
              <div className="col-span-2 text-center">Tồn kho</div>
              <div className="col-span-1 text-center">Trạng thái</div>
              <div className="col-span-2 text-center">Thao tác</div>
            </motion.div>

            {/* Product Items */}
            <ul>
              {products.map((product, index) => (
                <motion.li
                  key={product.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  {/* Mobile View */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start gap-3">
                      <img
                        className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                        src={
                          product.imageUrl
                            ? `http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`
                            : "/placeholder.svg?height=80&width=80"
                        }
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate overflow-hidden">{product.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          <p className="text-gray-500 flex items-center">
                            <Tag className="w-3.5 h-3.5 mr-1" />
                            {product.categoryName || "Chưa phân loại"}
                          </p>
                          <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}
                          >
                            {product.status === "ACTIVE"
                              ? "Đang bán"
                              : product.status === "INACTIVE"
                                ? "Đã ẩn"
                                : product.status === "OUT_OF_STOCK"
                                  ? "Hết hàng"
                                  : product.status === "PENDING"
                                    ? "Chờ duyệt"
                                    : product.status}
                          </span>
                          <span className={`text-xs ${getStockLevelStyle(product.stockQuantity)}`}>
                            Còn {product.stockQuantity} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      {product.status === "ACTIVE" ? (
                        <Link
                          to={`/trang-chu/san-pham/chi-tiet-san-pham/${product.id}`}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span
                          className="p-2 text-gray-400 cursor-not-allowed rounded-full"
                          title="Chỉ sản phẩm đang hoạt động mới có thể xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </span>
                      )}
                      <Link
                        to={`/trang-chu/nguoi-dung/san-pham/${product.id}/chinh-sua`}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/trang-chu/nguoi-dung/san-pham/${product.id}/xoa`}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-5">
                      <div className="flex items-center gap-3">
                        <img
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                          src={
                            product.imageUrl
                              ? `http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`
                              : "/placeholder.svg?height=64&width=64"
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg?height=64&width=64"
                          }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 truncate overflow-hidden max-w-xs">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <Layers className="w-3.5 h-3.5 mr-1" />
                            {product.categoryName || "Chưa phân loại"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-medium text-gray-900 flex items-center justify-end">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`font-medium ${getStockLevelStyle(product.stockQuantity)}`}>
                        {product.stockQuantity}
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.status)}`}
                      >
                        {product.status === "ACTIVE"
                          ? "Đang bán"
                          : product.status === "INACTIVE"
                            ? "Đã ẩn"
                            : product.status === "OUT_OF_STOCK"
                              ? "Hết hàng"
                              : product.status === "PENDING"
                                ? "Chờ duyệt"
                                : product.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex justify-between">
                        {product.status === "ACTIVE" ? (
                          <Link
                            to={`/trang-chu/nguoi-dung/san-pham/chi-tiet-san-pham/${product.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                          </Link>
                        ) : (
                          <span
                            className="flex items-center px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                            title="Chỉ sản phẩm đang hoạt động mới có thể xem chi tiết"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                          </span>
                        )}
                        <Link
                          to={`/trang-chu/nguoi-dung/san-pham/${product.id}/chinh-sua`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                        </Link>
                        <Link
                          to={`/trang-chu/nguoi-dung/san-pham/${product.id}/xoa`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </motion.div>

      {/* Pagination */}
      {products.length > 0 && (
        <motion.div
          className="bg-white rounded-xl shadow-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="text-sm text-gray-600">
            Hiển thị {products.length} trên tổng số {totalProducts} sản phẩm
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(0)}
              disabled={filters.page === 0}
              className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Trang đầu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 0}
              className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Show pages around current page
                let pageToShow
                if (totalPages <= 5) {
                  pageToShow = i
                } else if (filters.page < 2) {
                  pageToShow = i
                } else if (filters.page > totalPages - 3) {
                  pageToShow = totalPages - 5 + i
                } else {
                  pageToShow = filters.page - 2 + i
                }

                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium ${
                      filters.page === pageToShow ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageToShow + 1}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= totalPages - 1}
              className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={filters.page >= totalPages - 1}
              className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Trang cuối"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={filters.size}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  size: Number(e.target.value),
                  page: 0,
                })
              }
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MyProducts

