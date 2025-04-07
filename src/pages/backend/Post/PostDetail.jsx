import { useState, useEffect } from "react";
import { Calendar, Clock, Eye, Edit, Trash2, User } from "lucide-react";
import PostService from "../../../api/PostServive";
import { Link, useParams } from "react-router-dom";

const PostDetails = ({ onEdit, onDelete }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch post data
        const postData = await PostService.getPostById(id);
        setPost(postData);

        // Increment view count - try/catch in case this endpoint doesn't exist
        try {
          await PostService.incrementViewCount(id);
        } catch (viewErr) {
          console.error("Error incrementing view count:", viewErr);
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
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-800 p-4 my-4 rounded-r-md">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-yellow-900/20 border-l-4 border-yellow-800 p-4 my-4 rounded-r-md">
        <p className="text-yellow-300">Không tìm thấy bài viết</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="bg-gray-800 rounded-lg shadow-xl overflow-hidden container mx-auto">
      {post.hasImage && (
        <div className="w-full h-96 relative">
          <img
            src={PostService.getPostImageUrl(post.id) || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400/EEE/31343C";
            }}
          />
        </div>
      )}

      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center text-sm text-gray-300 mb-6 gap-4">
          {post.author && (
            <div className="flex items-center">
              <User size={16} className="mr-1.5" />
              <span>{post.author.name || "Ẩn danh"}</span>
            </div>
          )}

          <div className="flex items-center">
            <Calendar size={16} className="mr-1.5" />
            <span>{formatDate(post.createdAt)}</span>
          </div>

          {post.createdAt !== post.updatedAt && (
            <div className="flex items-center">
              <Clock size={16} className="mr-1.5" />
              <span>Cập nhật: {formatDate(post.updatedAt)}</span>
            </div>
          )}

          {post.status && (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                post.status === "ACTIVE"
                  ? "bg-green-900/60 text-green-300"
                  : post.status === "INACTIVE"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-yellow-900/60 text-yellow-300"
              }`}
            >
              {post.status === "ACTIVE"
                ? "Đang hiển thị"
                : post.status === "INACTIVE"
                ? "Đã ẩn"
                : "Chờ duyệt"}
            </div>
          )}

          {post.viewCount !== undefined && (
            <div className="flex items-center">
              <Eye size={16} className="mr-1.5" />
              <span>{post.viewCount} lượt xem</span>
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none mb-6 text-gray-300">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex gap-4 mt-8 border-t border-gray-700 pt-4">
          <Link to={`/admin/posts/edit/${id}`}
            className="flex items-center px-4 py-2 bg-blue-900/30 text-blue-300 rounded-md hover:bg-blue-800/50 transition-colors"
          >
            <Edit size={16} className="mr-1.5" />
            Chỉnh sửa
          </Link>
          <button
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
                onDelete && onDelete(post.id);
              }
            }}
            className="flex items-center px-4 py-2 bg-red-900/30 text-red-300 rounded-md hover:bg-red-800/50 transition-colors"
          >
            <Trash2 size={16} className="mr-1.5" />
            Xóa
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostDetails;
