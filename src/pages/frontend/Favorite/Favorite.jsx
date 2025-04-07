"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Heart, Home, ChevronRight, Trash2, ShoppingBag, Loader2, ArrowRight, ShoppingCart, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import FavoriteService from "../../../api/FavoriteService"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const Favorite = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [productToRemove, setProductToRemove] = useState(null)

  // Fetch favorite products
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true)
        const data = await FavoriteService.getUserFavorites()
        setFavorites(data.content || [])
        setError(null)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error)
        setError("Không thể tải danh sách yêu thích. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  // Confirm removal of favorite product
  const confirmRemoveFavorite = (product) => {
    setProductToRemove(product)
    setShowConfirmation(true)
  }

  // Remove favorite product
  const handleRemoveFavorite = async (productId) => {
    try {
      setRemovingId(productId)
      await FavoriteService.removeFavorite(productId)
      setFavorites(favorites.filter((item) => item.productId !== productId))
      setShowConfirmation(false)
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm yêu thích:", error)
      setError("Không thể xóa sản phẩm yêu thích. Vui lòng thử lại.")
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section with tech-themed background */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Bộ Sưu Tập Yêu Thích</h1>
            <p className="text-indigo-100 text-lg">
              Những sản phẩm thời trang công nghệ bạn đã lưu lại để theo dõi và mua sắm sau này
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center space-x-1 text-sm">
            <li className="inline-flex items-center">
              <Link
                to="/trang-chu"
                className="text-gray-600 hover:text-indigo-600 inline-flex items-center transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span className="text-indigo-600 ml-1 md:ml-2 text-sm font-medium" aria-current="page">
                  Yêu thích
                </span>
              </div>
            </li>
          </ol>
        </motion.nav>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4">
            <Heart className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
            <p className="text-gray-500 mt-1">Quản lý danh sách sản phẩm bạn đã đánh dấu yêu thích</p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center py-20"
          >
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-500 text-lg">Đang tải danh sách yêu thích...</p>
          </motion.div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Thử lại
            </motion.button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && favorites.length === 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-50 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn chưa có sản phẩm yêu thích nào</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Khám phá bộ sưu tập thời trang công nghệ của chúng tôi và lưu lại những sản phẩm bạn yêu thích
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/trang-chu/san-pham"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Khám phá sản phẩm
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Favorites Grid */}
        {!loading && !error && favorites.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {favorites.map((product) => (
              <motion.div
                key={product.productId}
                variants={fadeInUp}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden aspect-square">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={`http://localhost:8088/api/v1/product-images/get-image/${product.productImageUrl}`}
                    alt={product.productName}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/300x300/indigo/white?text=Fashion+Tech"
                      e.target.onerror = null
                    }}
                  />

                  {/* Quick action buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Link
                      to={`/trang-chu/san-pham/chi-tiet-san-pham/${product.productId}`}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => confirmRemoveFavorite(product)}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 hover:text-pink-500 transition-colors"
                      disabled={removingId === product.productId}
                      aria-label="Xóa khỏi yêu thích"
                    >
                      {removingId === product.productId ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Favorite badge */}
                  <div className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Yêu thích
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-indigo-600 transition-colors">
                    {product.productName}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mt-auto mb-3">
                    {product.productPrice.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/trang-chu/san-pham/chi-tiet-san-pham/${product.productId}`}
                      className="flex items-center justify-center py-2 px-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Link>
                    <Link
                      to={`/trang-chu/gio-hang?add=${product.productId}`}
                      className="flex items-center justify-center py-2 px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Mua ngay
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state action */}
        {!loading && !error && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 text-center"
          >
            <Link
              to="/trang-chu/san-pham"
              className="inline-flex items-center px-6 py-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Khám phá thêm sản phẩm
            </Link>
          </motion.div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && productToRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa khỏi danh sách yêu thích?</h3>
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn xóa sản phẩm "{productToRemove.productName}" khỏi danh sách yêu thích?
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowConfirmation(false)}
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center justify-center"
                  onClick={() => handleRemoveFavorite(productToRemove.productId)}
                  disabled={removingId === productToRemove.productId}
                >
                  {removingId === productToRemove.productId ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Favorite

