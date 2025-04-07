"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import PostService from "../../../api/PostServive"
import { ChevronLeft, ChevronRight, Eye, User, Calendar, Home, Clock, ArrowRight, Bookmark } from "lucide-react"

const Post = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await PostService.getPagedPosts(page, size)
        setPosts(response.content || [])
        setTotalPages(response.totalPages || 0)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [page, size])

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleView = (postId) => {
    navigate(`/trang-chu/bai-viet/${postId}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex mb-8"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
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
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                  to="/trang-chu/bai-viet"
                  className="text-gray-600 hover:text-indigo-600 ml-1 md:ml-2 text-sm font-medium transition-colors"
                >
                  Bài viết
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-indigo-600 ml-1 md:ml-2 text-sm font-medium" aria-current="page">
                  Xu hướng công nghệ
                </span>
              </div>
            </li>
          </ol>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12 relative"
        >
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-100 rounded-full opacity-50 blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-xl"></div>

          <div className="relative">
            <motion.span
              variants={fadeInUp}
              className="inline-block px-3 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-full mb-3"
            >
              VDUCKTIE STORE
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight"
            >
              Xu hướng thời trang <span className="text-indigo-600">công nghệ</span> mới nhất
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-gray-600 text-lg max-w-3xl leading-relaxed">
              Khám phá những bộ sưu tập, xu hướng và công nghệ đột phá trong ngành thời trang hiện đại
            </motion.p>
          </div>
        </motion.div>

        {/* Featured post - only show if there are posts */}
        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="md:flex">
              <div className="md:w-1/2 lg:w-3/5">
                <img
                  src={PostService.getPostImageUrl(posts[0].id) || "/placeholder.svg"}
                  alt={posts[0].title}
                  className="h-64 md:h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=400&width=600"
                    e.target.onerror = null
                  }}
                />
              </div>
              <div className="p-6 md:p-8 md:w-1/2 lg:w-2/5 flex flex-col justify-center">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                  Bài viết nổi bật
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-indigo-700 transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">{posts[0].content?.slice(0, 180)}...</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  {posts[0].authorName && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1 text-indigo-500" />
                      <span>{posts[0].authorName}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-indigo-500" />
                    <span>{formatDate(posts[0].createdAt)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleView(posts[0].id)}
                  className="px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm font-medium w-fit"
                >
                  Xem chi tiết
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-purple-400 animate-spin"></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Post list */}
        {!loading && Array.isArray(posts) && posts.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {posts.slice(1).map((post) => (
              <motion.div
                key={post.id}
                variants={fadeInUp}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 transform group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={PostService.getPostImageUrl(post.id) || "/placeholder.svg"}
                    alt={post.title}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=300"
                      e.target.onerror = null
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content?.slice(0, 120)}...</p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-indigo-500" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>

                    {post.viewCount !== undefined && (
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1 text-indigo-500" />
                        <span>{post.viewCount} lượt xem</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleView(post.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Không có bài viết nào</h3>
              <p className="text-gray-500 mb-6">Hiện tại chưa có bài viết nào được đăng tải.</p>
              <Link
                to="/trang-chu"
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Quay lại trang chủ
              </Link>
            </motion.div>
          )
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row justify-between items-center"
          >
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Hiển thị trang <span className="font-medium text-indigo-600">{page + 1}</span> trên{" "}
              <span className="font-medium">{totalPages}</span> trang
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 0}
                className={`px-4 py-2 rounded-md flex items-center gap-1 ${
                  page <= 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Trang trước</span>
              </motion.button>

              {/* Page numbers */}
              <div className="hidden md:flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  // Show 2 pages before and after current page, or first 5 pages
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i
                  } else if (page < 2) {
                    pageNum = i
                  } else if (page > totalPages - 3) {
                    pageNum = totalPages - 5 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md ${
                        pageNum === page
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {pageNum + 1}
                    </motion.button>
                  )
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className={`px-4 py-2 rounded-md flex items-center gap-1 ${
                  page >= totalPages - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                <span className="hidden sm:inline">Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Post

