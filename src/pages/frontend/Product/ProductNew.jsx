"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  ChevronLeft,
  Grid3X3,
  Grid2X2,
  Loader2,
  Search,
  X,
  Sliders,
  Star,
  Heart,
  ShoppingBag,
  Eye,
} from "lucide-react"
import ProductService from "../../../api/ProductService"
import CategoryService from "../../../api/CategoryService"
import ProductCard from "../../../components/ProductCard"
import { animations, StaggerWhenVisible, AnimateWhenVisible } from "../../../utils/animation-utils"

const ProductNew = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'

  // Filter and Sort states
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortOption, setSortOption] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCategories()
    fetchNewProducts()
  }, [page, size, selectedCategory, sortOption, sortDirection])

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.getActiveCategories()
      setCategories(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Failed to load categories:", err)
    }
  }

  const fetchNewProducts = async () => {
    try {
      setLoading(true)
      const response = await ProductService.getProductNew(8, page, size, sortOption, sortDirection, selectedCategory)

      const processResponse = (data) => {
        setProducts(data.content || data)
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || data.length)
      }

      if (response.data) {
        processResponse(response.data)
      } else {
        processResponse(response)
      }
    } catch (err) {
      console.error("Error fetching new products:", err)
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSizeChange = (event) => {
    setSize(Number.parseInt(event.target.value, 10))
    setPage(0) // Reset to first page when changing size
  }

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value)
    setPage(0)
  }

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(":")
    setSortOption(field)
    setSortDirection(direction)
    setPage(0)
  }

  const handlePriceRangeChange = (type, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const applyFilters = () => {
    // Here you would implement the logic to apply price filters
    // For now, we'll just close the filter panel
    setFilterOpen(false)
    setPage(0)
  }

  const resetFilters = () => {
    setSelectedCategory("")
    setSortOption("createdAt")
    setSortDirection("desc")
    setPriceRange({ min: "", max: "" })
    setSearchQuery("")
    setPage(0)
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-indigo-900 to-purple-800 text-white mb-8"
      >
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-indigo-400 to-purple-300 bg-center bg-cover mix-blend-overlay"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            <span className="block">Bộ Sưu Tập Mới</span>
            <span className="text-indigo-200 text-2xl md:text-3xl font-light">VDUCKTIE STORE 2025</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-indigo-100 text-center max-w-2xl mx-auto text-lg"
          >
            Khám phá những thiết kế công nghệ mới nhất, kết hợp giữa thời trang và đổi mới
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pr-12 rounded-full bg-white/10 backdrop-blur-sm border border-indigo-300/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-200 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 pb-16">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex mb-6"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                to="/trang-chu"
                className="text-gray-600 hover:text-indigo-600 inline-flex items-center transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <Link
                  to="/trang-chu/san-pham"
                  className="text-gray-600 hover:text-indigo-600 ml-1 md:ml-2 text-sm font-medium transition-colors"
                >
                  Sản phẩm
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span className="text-indigo-600 ml-1 md:ml-2 text-sm font-medium" aria-current="page">
                  Sản phẩm mới
                </span>
              </div>
            </li>
          </ol>
        </motion.nav>

        {/* Active filters */}
        {(selectedCategory || priceRange.min || priceRange.max || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 mb-6 bg-indigo-50 p-3 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>

            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {categories.find((c) => c.id === selectedCategory)?.name || "Danh mục"}
                <button onClick={() => setSelectedCategory("")} className="ml-1 text-indigo-600 hover:text-indigo-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(priceRange.min || priceRange.max) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Giá: {priceRange.min || "0"} - {priceRange.max || "Max"}
                <button
                  onClick={() => setPriceRange({ min: "", max: "" })}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="ml-1 text-indigo-600 hover:text-indigo-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Xóa tất cả
            </button>
          </motion.div>
        )}

        {/* Filters and controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-2 w-full md:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${
                filterOpen ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white hover:bg-gray-50"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Bộ lọc</span>
              {filterOpen ? (
                <ChevronRight className="w-4 h-4 transform rotate-90" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </motion.button>

            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </motion.select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={`${sortOption}:${sortDirection}`}
              onChange={handleSortChange}
              className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors w-full md:w-auto"
            >
              <option value="createdAt:desc">Mới nhất</option>
              <option value="createdAt:asc">Cũ nhất</option>
              <option value="price:asc">Giá: Thấp đến Cao</option>
              <option value="price:desc">Giá: Cao đến Thấp</option>
              <option value="name:asc">Tên: A-Z</option>
              <option value="name:desc">Tên: Z-A</option>
            </motion.select>

            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors"
              onChange={handleSizeChange}
              value={size}
            >
              <option value="8">8 sản phẩm</option>
              <option value="12">12 sản phẩm</option>
              <option value="16">16 sản phẩm</option>
              <option value="24">24 sản phẩm</option>
            </motion.select>

            <div className="flex border rounded-md overflow-hidden">
              <motion.button
                whileHover={{ backgroundColor: viewMode !== "grid" ? "#f5f5f5" : undefined }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 ${viewMode === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white"}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: viewMode !== "list" ? "#f5f5f5" : undefined }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "bg-white"}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <Grid2X2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filter panel - conditionally rendered */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Khoảng giá</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Đánh giá</label>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`rating-${rating}`}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700 flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          {Array.from({ length: 5 - rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                          <span className="ml-1">& trở lên</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Tính năng</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feature-new"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="feature-new" className="ml-2 text-sm text-gray-700">
                        Mới nhất
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feature-sale"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="feature-sale" className="ml-2 text-sm text-gray-700">
                        Đang giảm giá
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feature-bestseller"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="feature-bestseller" className="ml-2 text-sm text-gray-700">
                        Bán chạy
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="feature-limited"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="feature-limited" className="ml-2 text-sm text-gray-700">
                        Phiên bản giới hạn
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Áp dụng
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products display */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center py-20"
          >
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-500">Đang tải sản phẩm...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <p className="text-red-600 mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchNewProducts}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Thử lại
            </motion.button>
          </motion.div>
        ) : (
          <>
            {!products || products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 text-lg mb-4">Hiện tại không có sản phẩm mới phù hợp với bộ lọc.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Product count */}
                <div className="mb-6 text-sm text-gray-600">
                  Hiển thị <span className="font-medium text-indigo-600">{products.length}</span> trên tổng số{" "}
                  <span className="font-medium">{totalElements}</span> sản phẩm
                </div>

                {/* Products grid/list */}
                <StaggerWhenVisible
                  className={`grid ${
                    viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
                  } gap-6 md:gap-8`}
                  staggerDelay={0.1}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id || index}
                      variants={animations.fadeInUp}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                      className={`group ${
                        viewMode === "list"
                          ? "flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                          : ""
                      }`}
                    >
                      {product ? (
                        viewMode === "list" ? (
                          // List view custom layout
                          <div className="flex flex-col md:flex-row w-full gap-6">
                            <div className="relative md:w-1/3 lg:w-1/4">
                              <div className="relative overflow-hidden rounded-lg aspect-square md:aspect-[4/5]">
                                <img
                                  src={
                                    product.imageUrl || "https://placehold.co/300x300/indigo/white?text=Fashion+Tech"
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.src = "https://placehold.co/300x300/indigo/white?text=Fashion+Tech"
                                    e.target.onerror = null
                                  }}
                                />
                                {product.discount > 0 && (
                                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    -{product.discount}%
                                  </div>
                                )}
                                {product.isNew && (
                                  <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    NEW
                                  </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
                                  >
                                    <Heart className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                              <div className="mb-2">
                                {product.category && (
                                  <span className="text-xs text-indigo-600 font-medium">{product.category}</span>
                                )}
                                <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                  {product.name}
                                </h3>
                              </div>

                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {product.description ||
                                  "Sản phẩm thời trang công nghệ cao cấp, thiết kế hiện đại và tinh tế."}
                              </p>

                              <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < (product.rating || 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
                              </div>

                              <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                      product.price,
                                    )}
                                  </span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                        product.originalPrice,
                                      )}
                                    </span>
                                  )}
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  Thêm vào giỏ
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Grid view - use the ProductCard component
                          <div className="product-card-wrapper h-full">
                            <ProductCard product={product} />
                          </div>
                        )
                      ) : (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-red-500">Lỗi hiển thị sản phẩm</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </StaggerWhenVisible>

                {/* Custom pagination */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-12 flex flex-col items-center"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className="p-2 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Show pages around current page
                      let pageToShow
                      if (totalPages <= 5) {
                        pageToShow = i
                      } else if (page < 3) {
                        pageToShow = i
                      } else if (page > totalPages - 3) {
                        pageToShow = totalPages - 5 + i
                      } else {
                        pageToShow = page - 2 + i
                      }

                      return (
                        <motion.button
                          key={pageToShow}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePageChange(pageToShow)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            page === pageToShow ? "bg-indigo-600 text-white" : "hover:bg-indigo-50 border"
                          }`}
                        >
                          {pageToShow + 1}
                        </motion.button>
                      )
                    })}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Trang <span className="font-medium text-indigo-600">{page + 1}</span> / {totalPages}
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductNew

