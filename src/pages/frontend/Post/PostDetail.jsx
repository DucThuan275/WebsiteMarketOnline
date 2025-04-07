import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PostService from "../../../api/PostServive";
import DOMPurify from "dompurify";
import {
  User,
  Calendar,
  Clock,
  Eye,
  Tag,
  ChevronLeft,
  ChevronRight,
  Home,
  Share2,
  Bookmark,
  Printer,
  Heart,
  ArrowLeft,
  MessageCircle,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { animations, AnimateWhenVisible } from "../../../utils/animation-utils";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);

        // Fetch post data
        const postData = await PostService.getPostById(id);
        setPost(postData);

        // Increment view count - try/catch in case this endpoint doesn't exist
        try {
          await PostService.incrementViewCount(id);
        } catch (viewErr) {
          console.error("Error incrementing view count:", viewErr);
        }

        // Fetch related posts if available
        try {
          const related = await PostService.getRelatedPosts(postData.id, id);
          setRelatedPosts(related?.slice(0, 3) || []);
        } catch (relatedErr) {
          console.error("Error fetching related posts:", relatedErr);
          setRelatedPosts([]);
        }
      } catch (err) {
        console.error("Error fetching post details:", err);
        if (err.status === 404) {
          setError("Bài viết không tồn tại hoặc đã bị xóa.");
        } else {
          setError("Không thể tải chi tiết bài viết. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPostDetail();
      window.scrollTo(0, 0);
    }

    return () => {
      setPost(null);
      setRelatedPosts([]);
    };
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // Function to safely render HTML content
  const renderContent = (content) => {
    if (!content)
      return <p className="text-gray-500 italic">Không có nội dung</p>;

    // Check if content is plain text (no HTML tags)
    if (content === DOMPurify.sanitize(content, { ALLOWED_TAGS: [] })) {
      // Plain text - split by paragraphs
      return content.split("\n").map((paragraph, index) =>
        paragraph.trim() ? (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ) : (
          <br key={index} />
        )
      );
    } else {
      // HTML content - sanitize and render
      return (
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShareSocial = (platform) => {
    let shareUrl = "";
    const postUrl = encodeURIComponent(window.location.href);
    const postTitle = encodeURIComponent(post.title || "");

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${postUrl}&text=${postTitle}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareOptions(false);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-12 max-w-4xl"
      >
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm p-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
            <div className="h-10 w-10 rounded-full border-t-2 border-b-2 border-purple-400 animate-spin absolute top-3 left-3"></div>
          </div>
          <p className="text-gray-600 mt-6 font-medium">Đang tải bài viết...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-12 max-w-4xl"
      >
        <div className="bg-red-50 border-l-4 border-red-500 p-6 my-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
          <div className="mt-4">
            <Link
              to="/trang-chu/bai-viet"
              className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-12 max-w-4xl"
      >
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 my-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-yellow-700 font-medium">
              Không tìm thấy bài viết
            </p>
          </div>
          <div className="mt-4">
            <Link
              to="/trang-chu/bai-viet"
              className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-12"
    >
      <div className="container mx-auto px-4 py-8">
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
                <span
                  className="text-indigo-600 ml-1 md:ml-2 text-sm font-medium line-clamp-1"
                  aria-current="page"
                >
                  {post.title}
                </span>
              </div>
            </li>
          </ol>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8"
          >
            <article className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 border border-gray-100">
              {/* Featured image */}
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full h-[400px] relative"
              >
                <img
                  src={
                    !imageError
                      ? PostService.getPostImageUrl(post.id)
                      : "/placeholder.svg?height=400&width=800"
                  }
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image failed to load");
                    setImageError(true);
                    e.target.src = "/placeholder.svg?height=400&width=800";
                  }}
                />

                {/* Category badge if available */}
                {post.category && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute top-4 left-4"
                  >
                    <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </motion.div>
                )}

                {/* Gradient overlay at the bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
              </motion.div>

              <div className="p-6 md:p-8">
                {/* Status badge */}
                {post.status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
                  >
                    {post.status}
                  </motion.div>
                )}

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight"
                >
                  {post.title}
                </motion.h1>

                {/* Meta information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-wrap items-center text-sm text-gray-600 mb-6 gap-4"
                >
                  {post.authorName && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1.5 text-indigo-500" />
                      <span>{post.authorName}</span>
                    </div>
                  )}

                  <div
                    className="flex items-center"
                    title={`Đăng lúc ${formatTime(post.createdAt)}`}
                  >
                    <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>

                  {post.createdAt !== post.updatedAt && (
                    <div
                      className="flex items-center"
                      title={`Cập nhật lúc ${formatTime(post.updatedAt)}`}
                    >
                      <Clock className="w-4 h-4 mr-1.5 text-indigo-500" />
                      <span>Cập nhật: {formatDate(post.updatedAt)}</span>
                    </div>
                  )}

                  {post.viewCount !== undefined && (
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1.5 text-indigo-500" />
                      <span>{post.viewCount || 0} lượt xem</span>
                    </div>
                  )}
                </motion.div>

                {/* Social sharing */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex items-center space-x-2 mb-8 border-y border-gray-100 py-4 relative"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                      liked
                        ? "bg-pink-50 text-pink-600"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } transition-all duration-200`}
                  >
                    <Heart
                      className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
                    />
                    <span>{liked ? "Đã thích" : "Thích"}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                      showShareOptions
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } transition-all duration-200`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </motion.button>

                  {showShareOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 top-16 bg-white rounded-lg shadow-lg border border-gray-100 p-3 z-10 w-64"
                    >
                      <div className="grid gap-2">
                        <button
                          onClick={handleCopyLink}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-sm text-gray-700 transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                          <span>
                            {copySuccess ? "Đã sao chép!" : "Sao chép liên kết"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleShareSocial("facebook")}
                          className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-md text-sm text-gray-700 transition-colors"
                        >
                          <Facebook className="w-4 h-4 text-blue-600" />
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShareSocial("twitter")}
                          className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-md text-sm text-gray-700 transition-colors"
                        >
                          <Twitter className="w-4 h-4 text-blue-400" />
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShareSocial("linkedin")}
                          className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-md text-sm text-gray-700 transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-blue-700" />
                          <span>LinkedIn</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                      bookmarked
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } transition-all duration-200`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`}
                    />
                    <span>{bookmarked ? "Đã lưu" : "Lưu"}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">In</span>
                  </motion.button>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="prose prose-lg max-w-none mb-8"
                >
                  {renderContent(post.content)}
                </motion.div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mt-8 pt-6 border-t border-gray-100"
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                      Tags:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <motion.Link
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          to={`/trang-chu/bai-viet/tag/${tag}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          #{tag}
                        </motion.Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </article>

            {/* Author bio if available */}
            {post.authorName && (
              <AnimateWhenVisible
                variants={animations.fadeInUp}
                className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-10 h-10 text-indigo-500" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {post.authorName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {post.authorBio || "Tác giả bài viết"}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href="#"
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href="#"
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href="#"
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </AnimateWhenVisible>
            )}

            {/* Comments section */}
            <AnimateWhenVisible
              variants={animations.fadeInUp}
              className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-gray-900">
                  Bình luận (0)
                </h3>
              </div>

              <div className="mb-6">
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Viết bình luận của bạn..."
                  rows={4}
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Gửi bình luận
              </motion.button>
            </AnimateWhenVisible>

            {/* Navigation buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex justify-between mt-8"
            >
              <motion.Link
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.98 }}
                to="/trang-chu/bai-viet"
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </motion.Link>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="lg:col-span-4"
          >
            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <AnimateWhenVisible
                variants={animations.fadeInUp}
                className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
              >
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    Bài viết liên quan
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div
                      key={relatedPost.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 * index, duration: 0.5 }}
                    >
                      <Link
                        to={`/trang-chu/bai-viet/${relatedPost.id}`}
                        className="block p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
                            <img
                              src={
                                PostService.getPostImageUrl(relatedPost.id) ||
                                "/placeholder.svg"
                              }
                              alt={relatedPost.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                e.target.src =
                                  "/placeholder.svg?height=80&width=80";
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-indigo-600 transition-colors">
                              {relatedPost.title}
                            </h3>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-indigo-400" />
                              {formatDate(relatedPost.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </AnimateWhenVisible>
            )}

            {/* Popular categories */}
            <AnimateWhenVisible
              variants={animations.fadeInUp}
              className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
            >
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Danh mục</h2>
              </div>
              <div className="p-5">
                <div className="grid gap-2">
                  {[
                    "Thời trang công nghệ",
                    "Xu hướng mới",
                    "Bộ sưu tập",
                    "Phong cách sống",
                  ].map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <Link
                        to={`/trang-chu/bai-viet/danh-muc/${category
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                      >
                        <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">
                          {category}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimateWhenVisible>

            {/* Newsletter subscription */}
            <AnimateWhenVisible
              variants={animations.fadeInUp}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm overflow-hidden border border-indigo-100"
            >
              <div className="p-6">
                <motion.h2
                  variants={animations.fadeInUp}
                  className="text-lg font-bold text-gray-900 mb-2"
                >
                  Đăng ký nhận tin
                </motion.h2>
                <motion.p
                  variants={animations.fadeInUp}
                  className="text-gray-600 text-sm mb-4"
                >
                  Nhận thông báo khi có bài viết mới nhất về thời trang công
                  nghệ
                </motion.p>
                <motion.form
                  variants={animations.fadeInUp}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Đăng ký ngay
                  </motion.button>
                </motion.form>
              </div>
            </AnimateWhenVisible>

            {/* Trending tags */}
            <AnimateWhenVisible
              variants={animations.fadeInUp}
              className="bg-white rounded-xl shadow-sm overflow-hidden mt-6 border border-gray-100"
            >
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Xu hướng</h2>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {[
                    "fashion-tech",
                    "smart-clothing",
                    "wearables",
                    "eco-fashion",
                    "digital-fashion",
                    "tech-accessories",
                    "sustainable",
                    "innovation",
                  ].map((tag, index) => (
                    <motion.Link
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index, duration: 0.4 }}
                      to={`/trang-chu/bai-viet/tag/${tag}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      #{tag}
                    </motion.Link>
                  ))}
                </div>
              </div>
            </AnimateWhenVisible>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostDetail;
