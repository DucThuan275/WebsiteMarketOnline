"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import ReviewService from "../../../api/ReviewService"
import ProductService from "../../../api/ProductService"

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    }
  }
}

const AdminReviewList = () => {
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productReviews, setProductReviews] = useState([])
  const [replyText, setReplyText] = useState("")
  const [expandedReviews, setExpandedReviews] = useState({})
  const [productStats, setProductStats] = useState({})
  const [activeTab, setActiveTab] = useState("all") // all, verified, unverified
  const [loadingProduct, setLoadingProduct] = useState(false)

  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState("")
  const [productStatus, setProductStatus] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [productPage, setProductPage] = useState(0)
  const [productSize, setProductSize] = useState(20)

  // Animation state
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  
  // Set page as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch all products and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all products with filters
        const productsResponse = await ProductService.getAllProducts(
          searchKeyword,
          productStatus,
          categoryId,
          null, // sellerId
          null, // minPrice
          null, // maxPrice
          null, // minStock
          null, // maxStock
          productPage,
          productSize,
          "name", // sortField
          "asc", // sortDirection
        )

        if (productsResponse && productsResponse.content) {
          setProducts(productsResponse.content)
          setTotalPages(productsResponse.totalPages)
        }

        // Fetch reviews
        const reviewsResponse = await ReviewService.getAllReviews(page, 20)

        if (reviewsResponse && reviewsResponse.content) {
          const reviewsData = reviewsResponse.content
          setReviews(reviewsData)

          // Create product stats from reviews
          const productMap = {}

          // Initialize all products with zero reviews
          productsResponse.content.forEach((product) => {
            productMap[product.id] = {
              id: product.id,
              name: product.name,
              imageUrl: product.imageUrl,
              reviews: [],
              totalReviews: 0,
              averageRating: 0,
              totalRating: 0,
            }
          })

          // Update with review data
          reviewsData.forEach((review) => {
            if (!productMap[review.productId]) {
              productMap[review.productId] = {
                id: review.productId,
                name: review.productName,
                imageUrl: null, // We don't have image from reviews
                reviews: [],
                totalReviews: 0,
                averageRating: 0,
                totalRating: 0,
              }
            }

            productMap[review.productId].reviews.push(review)
            productMap[review.productId].totalReviews++
            productMap[review.productId].totalRating += review.rating
          })

          // Calculate average ratings
          Object.values(productMap).forEach((product) => {
            product.averageRating =
              product.totalReviews > 0 ? (product.totalRating / product.totalReviews).toFixed(1) : "0.0"
          })

          setProductStats(productMap)
        } else {
          console.error("Invalid response structure: ", reviewsResponse)
          toast.error("No reviews found.")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, productPage, searchKeyword, productStatus, categoryId])

  // Handle search input
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setProductPage(0) // Reset to first page when searching
      setSearchKeyword(e.target.value)
    }
  }

  const handleSearchChange = (e) => {
    if (e.target.value === "") {
      setProductPage(0)
      setSearchKeyword("")
    }
  }

  const handleProductSelect = async (productId) => {
    setSelectedProduct(productId)
    setLoadingProduct(true)

    try {
      // Fetch reviews for the selected product
      const response = await ReviewService.getProductReviews(productId, { page: 0, size: 50 })

      if (response && response.content) {
        // For each review, fetch its replies
        const reviewsWithReplies = await Promise.all(
          response.content.map(async (review) => {
            try {
              const repliesResponse = await ReviewService.getReviewReplies(review.id)
              return {
                ...review,
                replies: repliesResponse || [],
              }
            } catch (error) {
              console.error(`Error fetching replies for review ${review.id}:`, error)
              return {
                ...review,
                replies: [],
              }
            }
          }),
        )

        setProductReviews(reviewsWithReplies)
      } else {
        // If no reviews, set empty array
        setProductReviews([])
      }
    } catch (error) {
      console.error("Error fetching product reviews:", error)
      toast.error("Failed to load product reviews")
      setProductReviews([])
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleVerify = async (reviewId) => {
    try {
      await ReviewService.verifyReview(reviewId)
      toast.success("Review verified successfully")

      // Update reviews state
      setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, verified: true } : review)))

      // Update product reviews if viewing a product
      if (selectedProduct) {
        setProductReviews(
          productReviews.map((review) => (review.id === reviewId ? { ...review, verified: true } : review)),
        )
      }
    } catch (error) {
      toast.error("Failed to verify review")
    }
  }

  const handleUnverify = async (reviewId) => {
    try {
      await ReviewService.unverifyReview(reviewId)
      toast.success("Review unverified successfully")

      // Update reviews state
      setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, verified: false } : review)))

      // Update product reviews if viewing a product
      if (selectedProduct) {
        setProductReviews(
          productReviews.map((review) => (review.id === reviewId ? { ...review, verified: false } : review)),
        )
      }
    } catch (error) {
      toast.error("Failed to unverify review")
    }
  }

  const handleDelete = async (reviewId) => {
    try {
      await ReviewService.deleteReview(reviewId)
      toast.success("Review deleted successfully")

      // Update reviews state
      setReviews(reviews.filter((review) => review.id !== reviewId))

      // Update product reviews if viewing a product
      if (selectedProduct) {
        setProductReviews(productReviews.filter((review) => review.id !== reviewId))
      }
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty")
      return
    }

    try {
      const replyData = { content: replyText }
      const newReply = await ReviewService.addReply(reviewId, replyData, true)
      toast.success("Reply added successfully")
      setReplyText("")

      // Update the review with the new reply
      setProductReviews(
        productReviews.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              replies: [...(review.replies || []), newReply],
            }
          }
          return review
        }),
      )
    } catch (error) {
      toast.error("Failed to add reply")
    }
  }

  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  const filterReviewsByTab = (reviews) => {
    switch (activeTab) {
      case "verified":
        return reviews.filter((review) => review.verified)
      case "unverified":
        return reviews.filter((review) => !review.verified)
      default:
        return reviews
    }
  }

  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-500"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  // Get all products for the sidebar
  const allProducts = Object.values(productStats)

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Product List */}
      <motion.div 
        className="w-72 border-r border-gray-800 overflow-y-auto"
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={fadeInLeft}
      >
        <div className="p-4 border-b border-gray-800">
          <motion.h2 
            className="text-xl font-bold text-white"
            variants={fadeInUp}
          >
            Sản phẩm
          </motion.h2>
          <motion.p 
            className="text-sm text-gray-400 mt-1"
            variants={fadeInUp}
          >
            {allProducts.length} products
          </motion.p>

          <motion.div 
            className="relative mt-3"
            variants={fadeInUp}
          >
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-3 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={handleSearch}
              onChange={handleSearchChange}
            />
            <svg
              className="absolute right-3 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </motion.div>

          {/* Product filters */}
          <motion.div 
            className="mt-3 flex flex-col gap-2"
            variants={fadeInUp}
          >
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-1.5 px-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={productStatus}
              onChange={(e) => {
                setProductPage(0)
                setProductStatus(e.target.value)
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="PENDING">Đang chờ</option>
            </select>
          </motion.div>
        </div>

        <motion.div 
          className="divide-y divide-gray-800"
          variants={staggerContainer}
        >
          {loading
            ? // Loading skeleton for products
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <motion.div 
                    key={index} 
                    className="p-4 animate-pulse"
                    variants={fadeInUp}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-md"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </motion.div>
                ))
            : allProducts.map((product, index) => (
                <motion.button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className={`w-full text-left p-4 hover:bg-gray-800 transition-colors ${selectedProduct === product.id ? "bg-gray-800" : ""}`}
                  variants={fadeInUp}
                  custom={index}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-md overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          className="h-full w-full object-cover"
                          src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "https://placehold.co/600x400/EEE/31343C"
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <div className="flex items-center mt-1">
                        <StarRating rating={Math.round(product.averageRating)} />
                        <span className="ml-2 text-sm text-gray-400">{product.averageRating}</span>
                        <span className="ml-2 text-xs text-gray-500">({product.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
        </motion.div>

        {/* Sidebar pagination */}
        {!loading && products.length > 0 && (
          <motion.div 
            className="p-3 border-t border-gray-800 flex justify-between items-center"
            variants={fadeInUp}
          >
            <button
              onClick={() => setProductPage(Math.max(0, productPage - 1))}
              disabled={productPage === 0}
              className="p-1 rounded-md text-gray-400 hover:text-white disabled:opacity-50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <span className="text-xs text-gray-500">Page {productPage + 1}</span>
            <button
              onClick={() => setProductPage(productPage + 1)}
              className="p-1 rounded-md text-gray-400 hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col overflow-hidden"
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={fadeInRight}
      >
        {/* Header */}
        <motion.header 
          className="bg-gray-800 border-b border-gray-700 p-4"
          variants={fadeInUp}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Quản lý đánh giá</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md text-sm ${activeTab === "all" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab("verified")}
                className={`px-3 py-1 rounded-md text-sm ${activeTab === "verified" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Đã xác minh
              </button>
              <button
                onClick={() => setActiveTab("unverified")}
                className={`px-3 py-1 rounded-md text-sm ${activeTab === "unverified" ? "bg-yellow-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Chưa xác minh
              </button>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : selectedProduct ? (
            // Product Reviews View
            <div>
              <motion.div 
                className="mb-6 flex items-center justify-between"
                variants={fadeInUp}
              >
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-white mr-4 flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Quay lại
                  </button>

                  {productStats[selectedProduct]?.imageUrl && (
                    <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                      <img
                        className="h-full w-full object-cover"
                        src={`http://localhost:8088/api/v1/product-images/get-image/${productStats[selectedProduct].imageUrl}`}
                        alt={productStats[selectedProduct].name}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = "https://placehold.co/600x400/EEE/31343C"
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-bold">{productStats[selectedProduct]?.name || "Product Reviews"}</h2>
                    <div className="flex items-center mt-1">
                      <StarRating rating={Math.round(productStats[selectedProduct]?.averageRating || 0)} />
                      <span className="ml-2 font-medium">{productStats[selectedProduct]?.averageRating || 0}</span>
                      <span className="ml-2 text-sm text-gray-400">
                        ({productStats[selectedProduct]?.totalReviews || 0} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {loadingProduct ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : productReviews.length === 0 ? (
                <motion.div 
                  className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700"
                  variants={fadeInUp}
                >
                  <svg
                    className="w-16 h-16 mx-auto text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    ></path>
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-300">Chưa có đánh giá</h3>
                  <p className="mt-2 text-gray-500">Sản phẩm này chưa có đánh giá nào.</p>
                </motion.div>
              ) : filterReviewsByTab(productReviews).length === 0 ? (
                <motion.div 
                  className="text-center py-12 text-gray-500"
                  variants={fadeInUp}
                >
                  Không tìm thấy đánh giá nào cho sản phẩm này trong danh mục đã chọn.
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-6"
                  variants={staggerContainer}
                >
                  {filterReviewsByTab(productReviews).map((review, index) => (
                    <motion.div 
                      key={review.id} 
                      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                      variants={fadeInUp}
                      custom={index}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="font-medium">{review.userName}</div>
                                <div className="text-sm text-gray-400">
                                  {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center">
                              <StarRating rating={review.rating} />
                              <span className="ml-2 text-sm text-gray-400">{review.rating}/5</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {review.verified ? (
                              <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  ></path>
                                </svg>
                                Đã xác minh
                              </span>
                            ) : (
                              <span className="bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded-full">
                                Chưa xác minh
                              </span>
                            )}

                            {review.replies && review.replies.length > 0 && (
                              <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-full flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                  ></path>
                                </svg>
                                Đã trả lời
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-gray-300">{review.comment}</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => (review.verified ? handleUnverify(review.id) : handleVerify(review.id))}
                            className={`px-3 py-1 rounded-md text-xs ${review.verified ? "bg-yellow-700 text-yellow-100 hover:bg-yellow-600" : "bg-green-700 text-green-100 hover:bg-green-600"}`}
                          >
                            {review.verified ? "Hủy xác minh" : "Xác minh"}
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="px-3 py-1 rounded-md text-xs bg-red-700 text-red-100 hover:bg-red-600"
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => toggleReviewExpand(review.id)}
                            className={`px-3 py-1 rounded-md text-xs ${expandedReviews[review.id] ? "bg-purple-700 text-purple-100" : "bg-gray-700 text-gray-100 hover:bg-gray-600"}`}
                          >
                            {expandedReviews[review.id]
                              ? "Ẩn trả lời"
                              : review.replies && review.replies.length > 0
                                ? `Trả lời (${review.replies.length})`
                                : "Thêm trả lời"}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedReviews[review.id] && (
                          <motion.div 
                            className="bg-gray-900 p-4 border-t border-gray-700"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="font-medium mb-3 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                ></path>
                              </svg>
                              Trả lời
                            </h4>

                            {review.replies && review.replies.length > 0 ? (
                              <motion.div 
                                className="space-y-3 mb-4"
                                variants={staggerContainer}
                              >
                                {review.replies.map((reply, replyIndex) => (
                                  <motion.div 
                                    key={reply.id} 
                                    className="bg-gray-800 p-3 rounded-md"
                                    variants={fadeInUp}
                                    custom={replyIndex}
                                  >
                                    <div className="flex items-center">
                                      <div
                                        className={`w-8 h-8 rounded-full ${reply.isAdmin ? "bg-purple-700" : "bg-gray-700"} flex items-center justify-center text-sm font-bold`}
                                      >
                                        {reply.isAdmin ? "A" : reply.userName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="ml-2">
                                        <div className="font-medium flex items-center">
                                          {reply.userName}
                                          {reply.isAdmin && (
                                            <span className="ml-2 bg-purple-900 text-purple-300 text-xs px-2 py-0.5 rounded-full">
                                              Quản trị viên
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {new Date(reply.createdAt || Date.now()).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-300">{reply.content}</p>
                                  </motion.div>
                                ))}
                              </motion.div>
                            ) : (
                              <div className="text-sm text-gray-500 mb-4">Chưa có trả lời</div>
                            )}

                            <div className="mt-3">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Viết trả lời với tư cách quản trị viên..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows="3"
                              ></textarea>
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => handleReplySubmit(review.id)}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors"
                                >
                                  Gửi trả lời
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          ) : (
            // All Reviews Overview
            <div>
              <motion.h2 
                className="text-xl font-bold mb-6"
                variants={fadeInUp}
              >
                Bảng điều khiển đánh giá
              </motion.h2>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={staggerContainer}
              >
                <motion.div 
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  variants={fadeInUp}
                >
                  <h3 className="text-lg font-medium mb-2">Tổng số đánh giá</h3>
                  <p className="text-3xl font-bold">{reviews.length}</p>
                </motion.div>
                <motion.div 
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  variants={fadeInUp}
                >
                  <h3 className="text-lg font-medium mb-2">Đánh giá đã xác minh</h3>
                  <p className="text-3xl font-bold">{reviews.filter((r) => r.verified).length}</p>
                </motion.div>
                <motion.div 
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  variants={fadeInUp}
                >
                  <h3 className="text-lg font-medium mb-2">Sản phẩm</h3>
                  <p className="text-3xl font-bold">{allProducts.length}</p>
                </motion.div>
                <motion.div 
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  variants={fadeInUp}
                >
                  <h3 className="text-lg font-medium mb-2">Đánh giá trung bình</h3>
                  <div className="flex items-center">
                    <p className="text-3xl font-bold mr-2">
                      {reviews.length > 0
                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : "0.0"}
                    </p>
                    <StarRating
                      rating={
                        reviews.length > 0
                          ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                          : 0
                      }
                    />
                  </div>
                </motion.div>
              </motion.div>

              <motion.h3 
                className="text-lg font-medium mb-4"
                variants={fadeInUp}
              >
                Sản phẩm gần đây
              </motion.h3>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
              >
                {allProducts.slice(0, 6).map((product, index) => (
                  <motion.div
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-colors"
                    variants={fadeInUp}
                    custom={index}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-md overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            className="h-full w-full object-cover"
                            src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "https://placehold.co/600x400/EEE/31343C"
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center mb-2">
                      <StarRating rating={Math.round(product.averageRating)} />
                      <span className="ml-2 text-sm text-gray-400">{product.averageRating}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{product.totalReviews} đánh giá</span>
                      <span className="text-gray-400">
                        {product.reviews.filter((r) => r.verified).length} đã xác minh
                      </span>
                    </div>

                    {product.totalReviews > 0 && product.reviews.some((r) => r.replies && r.replies.length > 0) && (
                      <div className="mt-2 text-xs text-purple-400 flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          ></path>
                        </svg>
                        Có trả lời từ quản trị viên
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </main>

        {/* Footer with Pagination */}
        {!selectedProduct && (
          <motion.footer 
            className="bg-gray-800 border-t border-gray-700 p-4"
            variants={fadeInUp}
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Trước
              </button>
              <span className="text-sm text-gray-400">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
              >
                Tiếp
              </button>
            </div>
          </motion.footer>
        )}
      </motion.div>
    </div>
  )
}

export default AdminReviewList
