"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock, User, ChevronLeft, ChevronRight } from "lucide-react"
import PostService from "../../../api/PostServive"
import { StaggerWhenVisible, animations } from "../../../utils/animation-utils"

const PostNew = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [size] = useState(9) // Changed to 9 for better grid layout
  const [totalPages, setTotalPages] = useState(0)
  const [featuredPost, setFeaturedPost] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await PostService.getPagedActivePosts(page, size)

        // Set the first post as featured if on first page
        if (page === 0 && response.content && response.content.length > 0) {
          setFeaturedPost(response.content[0])
          setPosts(response.content.slice(1) || [])
        } else {
          setPosts(response.content || [])
        }

        setTotalPages(response.totalPages || 0)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [page, size])

  const handleView = (postId) => {
    navigate(`/trang-chu/bai-viet/${postId}`)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("vi-VN", options)
  }

  // Estimate reading time (1 min per 200 words)
  const getReadingTime = (content) => {
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)
    return readingTime > 0 ? readingTime : 1
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Blog header with background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-neutral-50 border-b"
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-2"
          >
            Tin tức & Xu hướng
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-neutral-600 text-center max-w-2xl mx-auto"
          >
            Cập nhật những xu hướng thời trang mới nhất và bí quyết phong cách
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Featured post - only show on first page */}
        {page === 0 && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 group"
          >
            <div className="grid md:grid-cols-2 gap-6 bg-neutral-50 rounded-xl overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden h-64 md:h-auto"
              >
                <img
                  src={PostService.getPostImageUrl(featuredPost.id) || "/placeholder.svg"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center gap-4 text-sm text-neutral-500 mb-4"
                >
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(featuredPost.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getReadingTime(featuredPost.content)} phút đọc
                  </span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-2xl md:text-3xl font-bold mb-4"
                >
                  {featuredPost.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-neutral-600 mb-6 line-clamp-3"
                >
                  {featuredPost.content.slice(0, 200)}...
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-auto"
                >
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => handleView(featuredPost.id)}
                    className="inline-flex items-center gap-2 font-medium text-neutral-900 hover:text-neutral-600 transition-colors group"
                  >
                    Đọc tiếp
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
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
            className="flex justify-center items-center py-20"
          >
            <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-800 rounded-full animate-spin"></div>
          </motion.div>
        )}

        {/* Post list */}
        {!loading && (
          <>
            <StaggerWhenVisible
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              staggerDelay={0.2}
            >
              {Array.isArray(posts) && posts.length > 0
                ? posts.map((post) => (
                    <motion.div
                      key={post.id}
                      variants={animations.fadeInUp}
                      whileHover={{ y: -10, transition: { duration: 0.3 } }}
                      className="group bg-white border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="overflow-hidden h-48 md:h-56">
                        <img
                          src={PostService.getPostImageUrl(post.id) || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.authorName}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 mb-3 line-clamp-2">{post.title}</h2>
                        <p className="text-neutral-600 mb-4 text-sm line-clamp-3">{post.content.slice(0, 150)}...</p>
                        <motion.button
                          whileHover={{ x: 5 }}
                          onClick={() => handleView(post.id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors group"
                        >
                          Đọc tiếp
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                : !loading && (
                    <motion.div variants={animations.fadeInUp} className="col-span-full text-center py-12">
                      <p className="text-neutral-500 text-lg mb-4">Không có bài viết nào.</p>
                      <p className="text-neutral-400">Vui lòng quay lại sau.</p>
                    </motion.div>
                  )}
            </StaggerWhenVisible>

            {/* Custom pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex justify-center mt-12"
              >
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    className="p-2 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
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
                          page === pageToShow ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
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
                    className="p-2 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PostNew

