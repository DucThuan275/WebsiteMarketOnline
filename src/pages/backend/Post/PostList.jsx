import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Edit, Eye, Trash2, Check, X, AlertCircle, RefreshCw, FileText, Plus, Calendar, User, Tag } from "lucide-react"
import PostService from "../../../api/PostServive"

const PostList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" })
  const [expandedPost, setExpandedPost] = useState(null)

  const navigate = useNavigate()

  // Fetch posts with pagination
  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await PostService.getPagedPosts(page, size)
      setPosts(response.content || [])
      setTotalPages(response.totalPages || 0)
      setError("")
    } catch (err) {
      setError("Không thể tải danh sách bài viết")
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  // Load posts when component mounts or page changes
  useEffect(() => {
    fetchPosts()
  }, [page, size])

  // Handle page navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  // Handle post deletion
  const handleDelete = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        setLoading(true)
        await PostService.deletePost(postId)
        setPosts(posts.filter((post) => post.id !== postId))
        setStatusMessage({
          type: "success",
          message: "Bài viết đã được xóa thành công",
        })

        // Clear status message after 3 seconds
        setTimeout(() => {
          setStatusMessage({ type: "", message: "" })
        }, 3000)
      } catch (err) {
        setError("Không thể xóa bài viết")
        console.error("Error deleting post:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle status change
  const handleStatusChange = async (postId, currentStatus) => {
    try {
      setLoading(true)
      const newStatus = currentStatus === "ACTIVE" ? "PENDING" : "ACTIVE"
      await PostService.updatePostStatus(postId, newStatus)

      setPosts(posts.map((post) => (post.id === postId ? { ...post, status: newStatus } : post)))

      setStatusMessage({
        type: "success",
        message: `Bài viết đã được ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} thành công`,
      })

      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: "", message: "" })
      }, 3000)
    } catch (err) {
      setError("Không thể cập nhật trạng thái bài viết")
      console.error("Error changing post status:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle post view
  const handleView = (postId) => {
    navigate(`/admin/posts/${postId}`)
  }

  // Handle post update
  const handleUpdate = (postId) => {
    navigate(`/admin/posts/edit/${postId}`)
  }

  // Toggle expanded post view
  const toggleExpandPost = (id) => {
    if (expandedPost === id) {
      setExpandedPost(null)
    } else {
      setExpandedPost(id)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("vi-VN", options)
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Quản lý bài viết</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPosts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <Link
              to="/admin/posts/create"
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              <Plus size={18} />
              <span>Thêm bài viết</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {statusMessage.message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg flex items-center ${
            statusMessage.type === "success"
              ? "bg-green-900/20 border border-green-800/30 text-green-300"
              : "bg-red-900/20 border border-red-800/30 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <p>{statusMessage.message}</p>
        </div>
      )}

      <div className="p-6">
        {loading && !posts.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <FileText size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">Không tìm thấy bài viết nào</p>
            <p className="text-gray-400 mt-2">Hãy tạo bài viết mới để hiển thị trên trang web của bạn</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
                  post.status !== "ACTIVE" ? "opacity-70" : ""
                }`}
              >
                <div className="p-4 flex flex-col md:flex-row gap-4">
                  <div
                    className="w-full md:w-1/4 h-48 bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => toggleExpandPost(post.id)}
                  >
                    <img
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={PostService.getPostImageUrl(post.id)}
                      alt={post.title}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "https://placehold.co/600x400/EEE/31343C"
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{post.title}</h3>
                        <div className="flex flex-wrap items-center mt-1 gap-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              post.status === "ACTIVE"
                                ? "bg-green-900/60 text-green-300"
                                : "bg-yellow-900/60 text-yellow-300"
                            }`}
                          >
                            {post.status === "ACTIVE" ? "Đang hiển thị" : "Đang ẩn"}
                          </span>
                          <span className="text-gray-400 text-sm flex items-center">
                            <User size={14} className="mr-1" />
                            {post.authorName}
                          </span>
                          <span className="text-gray-400 text-sm flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex mt-4 md:mt-0 items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(post.id)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                          <span className="sr-only">Xem</span>
                        </button>
                        <button
                          onClick={() => handleUpdate(post.id)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                          <span className="sr-only">Sửa</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(post.id, post.status)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title={post.status === "ACTIVE" ? "Ẩn bài viết" : "Hiển thị bài viết"}
                        >
                          {post.status === "ACTIVE" ? <X size={16} /> : <Check size={16} />}
                          <span className="sr-only">{post.status === "ACTIVE" ? "Ẩn" : "Hiển thị"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-red-600 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Xóa</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-300 mt-2 line-clamp-2">{post.content}</p>

                    {/* Tags would go here if available in the data */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        <Tag size={12} className="mr-1" />
                        Thời trang
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        <Tag size={12} className="mr-1" />
                        Xu hướng
                      </span>
                    </div>
                  </div>
                </div>

                {expandedPost === post.id && (
                  <div className="p-4 bg-gray-700 border-t border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Thông tin chi tiết</h4>
                        <div className="space-y-2">
                          <p className="text-white">
                            <span className="text-gray-400">ID:</span> {post.id}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Tiêu đề:</span> {post.title}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Tác giả:</span> {post.authorName}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Ngày tạo:</span> {formatDate(post.createdAt)}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Trạng thái:</span>
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                post.status === "ACTIVE"
                                  ? "bg-green-900 text-green-300"
                                  : "bg-yellow-900 text-yellow-300"
                              }`}
                            >
                              {post.status === "ACTIVE" ? "Đang hiển thị" : "Đang ẩn"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Hình ảnh</h4>
                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            className="w-full h-auto max-h-64 object-contain"
                            src={PostService.getPostImageUrl(post.id)}
                            alt={post.title}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "https://placehold.co/600x400/EEE/31343C"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Nội dung</h4>
                      <div className="bg-gray-800 rounded-lg p-4 text-gray-300">{post.content}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {posts.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(0)}
                disabled={page <= 0}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">First page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>

              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 0}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Previous page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show 5 pages max, centered around current page
                  let pageToShow
                  if (totalPages <= 5) {
                    pageToShow = i
                  } else {
                    const start = Math.max(0, Math.min(page - 2, totalPages - 5))
                    pageToShow = start + i
                  }

                  return (
                    <button
                      key={pageToShow}
                      onClick={() => handlePageChange(pageToShow)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        page === pageToShow
                          ? "bg-pink-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {pageToShow + 1}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Next page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Last page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostList

