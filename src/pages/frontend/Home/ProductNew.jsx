"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Grid3X3, Grid2X2, Loader2 } from "lucide-react"
import ProductService from "../../../api/ProductService"
import ProductCard from "../../../components/ProductCard"
import { StaggerWhenVisible, animations } from "../../../utils/animation-utils"

const ProductNew = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    fetchNewProducts(true)
  }, [size])

  const fetchNewProducts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
      } else {
        setLoadingMore(true)
      }

      const currentPage = reset ? 0 : page

      const response = await ProductService.getProductNew(
        8, // Limit to 20 new products
        currentPage,
        size,
        "createdAt",
        "desc",
      )

      // Check different possible response structures
      let newProducts = []
      let newTotalPages = 0
      let newTotalElements = 0

      if (response && response.data && response.data.content) {
        newProducts = response.data.content
        newTotalPages = response.data.totalPages || 1
        newTotalElements = response.data.totalElements || response.data.content.length
      } else if (response && response.content) {
        newProducts = response.content
        newTotalPages = response.totalPages || 1
        newTotalElements = response.totalElements || response.content.length
      } else if (response && Array.isArray(response)) {
        newProducts = response
        newTotalPages = 1
        newTotalElements = response.length
      } else if (response && response.data && Array.isArray(response.data)) {
        newProducts = response.data
        newTotalPages = 1
        newTotalElements = response.data.length
      } else {
        console.error("Unrecognized API response structure:", response)
        setError("Received data in an unexpected format.")
        newProducts = []
      }

      if (reset) {
        setProducts(newProducts)
      } else {
        setProducts((prev) => [...prev, ...newProducts])
        setPage(currentPage + 1)
      }

      setTotalPages(newTotalPages)
      setTotalElements(newTotalElements)
      setHasMore(currentPage + 1 < newTotalPages)
    } catch (err) {
      console.error("Error fetching new products:", err)
      setError("Failed to load new products. Please try again later.")
      if (reset) {
        setProducts([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return
    fetchNewProducts(false)
  }

  const handleSizeChange = (event) => {
    setSize(Number.parseInt(event.target.value, 10))
    // Reset will happen in the useEffect
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-neutral-100 to-neutral-50 mb-8"
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            <span className="block">Bộ Sưu Tập Mới</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-neutral-600 text-center max-w-2xl mx-auto text-lg"
          >
            Khám phá những thiết kế mới nhất của chúng tôi, được tạo ra để nâng tầm phong cách của bạn
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 pb-16">
        {/* Filters and controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-neutral-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Lọc</span>
            </motion.button>
            <motion.select
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 border rounded-md bg-white hover:bg-neutral-50 transition-colors"
              onChange={handleSizeChange}
              value={size}
            >
              <option value="8">8 sản phẩm</option>
              <option value="12">12 sản phẩm</option>
              <option value="16">16 sản phẩm</option>
              <option value="24">24 sản phẩm</option>
            </motion.select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              Hiển thị {products.length} / {totalElements} sản phẩm
            </span>
            <div className="flex border rounded-md overflow-hidden">
              <motion.button
                whileHover={{ backgroundColor: viewMode !== "grid" ? "#f5f5f5" : undefined }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-2 ${viewMode === "grid" ? "bg-neutral-100" : "bg-white"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: viewMode !== "list" ? "#f5f5f5" : undefined }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-2 ${viewMode === "list" ? "bg-neutral-100" : "bg-white"}`}
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
              className="bg-neutral-50 p-4 rounded-lg mb-6 border"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Từ" className="w-full p-2 border rounded-md text-sm" />
                    <span>-</span>
                    <input type="number" placeholder="Đến" className="w-full p-2 border rounded-md text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Danh mục</label>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option value="">Tất cả danh mục</option>
                    <option value="1">Áo</option>
                    <option value="2">Quần</option>
                    <option value="3">Giày</option>
                    <option value="4">Phụ kiện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sắp xếp</label>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                    <option value="name-asc">Tên: A-Z</option>
                    <option value="name-desc">Tên: Z-A</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
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
            className="flex justify-center items-center py-20"
          >
            <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
          >
            <p className="text-red-600">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchNewProducts(true)}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
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
                className="text-center py-20"
              >
                <p className="text-neutral-500 text-lg mb-4">Hiện tại không có sản phẩm mới.</p>
                <p className="text-neutral-400">Vui lòng quay lại sau.</p>
              </motion.div>
            ) : (
              <>
                <StaggerWhenVisible
                  className={`grid ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1 md:grid-cols-2"
                  } gap-6 md:gap-8`}
                  staggerDelay={0.2}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id || index}
                      variants={animations.fadeInUp}
                      whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.3 }}
                      className={`group transition-all duration-300 ${
                        viewMode === "list" ? "p-4 border rounded-lg hover:shadow-md" : ""
                      }`}
                    >
                      {product ? (
                        <div className="product-card-wrapper">
                          <ProductCard product={product} />
                        </div>
                      ) : (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-red-500">Lỗi hiển thị sản phẩm</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </StaggerWhenVisible>

                {/* View More Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-12 flex flex-col items-center"
                >
                  <div className="text-sm text-neutral-500 mb-4">
                    Hiển thị {products.length} / {totalElements} sản phẩm
                  </div>

                  {hasMore && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <span>Xem thêm sản phẩm</span>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>

      {/* Newsletter section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className="bg-neutral-100 py-16"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl font-semibold mb-4"
            >
              Đăng ký nhận thông tin
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-neutral-600 mb-6"
            >
              Nhận thông báo về các bộ sưu tập mới và ưu đãi đặc biệt
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
              >
                Đăng ký
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProductNew

