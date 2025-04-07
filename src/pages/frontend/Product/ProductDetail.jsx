import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Flag,
  ChevronDown,
  Info,
  Share2,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import ProductService from "../../../api/ProductService";
import CartService from "../../../api/CartService";
import FavoriteService from "../../../api/FavoriteService";
import ReviewService from "../../../api/ReviewService";
import ProductCard from "../../../components/ProductCard";
import UserService from "../../../api/UserService";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Component for elements that animate when they come into view
const AnimateWhenVisible = ({ children, variants, className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [reviewsPerPage] = useState(5);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

  const [likedReviews, setLikedReviews] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReviewId, setReportModalReviewId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [isOwnProduct, setIsOwnProduct] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch product info, images, favorites
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = await ProductService.getProductById(Number(id));
        setProduct(data);
        setError(null);

        // Fetch user profile to check if this is the user's own product
        try {
          const userProfile = await UserService.getCurrentUserProfile();
          setCurrentUser(userProfile);
          setIsOwnProduct(userProfile && data.sellerId === userProfile.id);
        } catch (userErr) {
          console.error("Không thể tải thông tin người dùng", userErr);
        }

        // Fetch related products when product is loaded
        setRelatedProductsLoading(true);
        try {
          const relatedData = await ProductService.getRelatedProducts(
            Number(id),
            4,
            data.categoryId
          );
          setRelatedProducts(relatedData.content || []);
        } catch (relatedErr) {
          console.error("Không thể tải sản phẩm liên quan", relatedErr);
        } finally {
          setRelatedProductsLoading(false);
        }
      } catch (err) {
        setError("Không thể tải chi tiết sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProductImages = async () => {
      try {
        const images = await ProductService.getProductImages(Number(id));
        setProductImages(images);
      } catch (err) {
        console.error("Không thể tải hình ảnh sản phẩm", err);
      }
    };

    const checkIfProductIsFavorite = async () => {
      try {
        const favoriteStatus = await FavoriteService.isProductFavorited(
          Number(id)
        );
        setIsFavorite(favoriteStatus);
      } catch (err) {
        console.error("Không thể kiểm tra trạng thái yêu thích", err);
      }
    };

    fetchProductData();
    fetchProductImages();
    checkIfProductIsFavorite();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch reviews with pagination
        const reviewsData = await ReviewService.getProductReviews(Number(id), {
          page: currentPage,
          size: reviewsPerPage,
        });

        setReviews(reviewsData.content || []);

        // Calculate average rating manually since the stats endpoint might not be available
        if (reviewsData.content && reviewsData.content.length > 0) {
          const totalRating = reviewsData.content.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const avgRating = totalRating / reviewsData.content.length;
          setReviewStats({
            average: avgRating,
            count: reviewsData.totalElements || reviewsData.content.length,
          });
        }
      } catch (err) {
        console.error("Không thể tải đánh giá sản phẩm", err);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id, currentPage, reviewsPerPage]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleAddToCart = async () => {
    if (isOwnProduct) {
      // Show notification that user can't buy their own product
      const notification = document.getElementById("cartNotification");
      if (notification) {
        notification.textContent = "Bạn không thể mua sản phẩm của chính mình";
        notification.classList.remove("bg-blue-900");
        notification.classList.add("bg-red-600");
        notification.classList.remove("opacity-0");
        notification.classList.add("opacity-100");
        setTimeout(() => {
          notification.classList.remove("opacity-100");
          notification.classList.add("opacity-0");
        }, 3000);
      }
      return;
    }

    try {
      const itemData = {
        productId: product.id,
        quantity: quantity,
      };
      await CartService.addItemToCart(itemData);

      // Show success notification (could be replaced with a toast)
      const notification = document.getElementById("cartNotification");
      if (notification) {
        notification.textContent = "Đã thêm vào giỏ hàng";
        notification.classList.remove("bg-red-600");
        notification.classList.add("bg-blue-900");
        notification.classList.remove("opacity-0");
        notification.classList.add("opacity-100");
        setTimeout(() => {
          notification.classList.remove("opacity-100");
          notification.classList.add("opacity-0");
        }, 3000);
      }
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng", err);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await FavoriteService.removeFavorite(product.id);
      } else {
        await FavoriteService.addFavorite(product.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (isOwnProduct) {
      setReviewError("Bạn không thể đánh giá sản phẩm của chính mình");
      return;
    }

    setSubmitting(true);
    setReviewError(null);

    try {
      const reviewData = {
        productId: product.id,
        rating: newReview.rating,
        comment: newReview.comment,
      };

      await ReviewService.createReview(reviewData);

      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
      });

      setShowReviewForm(false);

      // Refresh reviews
      const updatedReviews = await ReviewService.getProductReviews(Number(id), {
        page: 0,
        size: reviewsPerPage,
      });

      setReviews(updatedReviews.content || []);

      // Update review statistics manually
      if (updatedReviews.content && updatedReviews.content.length > 0) {
        const totalRating = updatedReviews.content.reduce(
          (sum, review) => sum + review.rating,
          0
        );
        const avgRating = totalRating / updatedReviews.content.length;
        setReviewStats({
          average: avgRating,
          count: updatedReviews.totalElements || updatedReviews.content.length,
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá", err);
      setReviewError("Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    try {
      if (likedReviews.includes(reviewId)) return;

      await ReviewService.markReviewAsHelpful(reviewId);

      // Update the reviews list with the new helpful count
      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
            : review
        )
      );

      // Mark this review as liked by the current user
      setLikedReviews([...likedReviews, reviewId]);
    } catch (err) {
      console.error("Lỗi khi đánh dấu đánh giá là hữu ích", err);
    }
  };

  const handleReportClick = (reviewId) => {
    setReportModalReviewId(reviewId);
    setReportModalOpen(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);

    try {
      await ReviewService.reportReview(reportReviewId, reportReason);

      // Close modal and reset form
      setReportModalOpen(false);
      setReportReason("");
      setReportModalReviewId(null);

      // Show success notification
      alert(
        "Cảm ơn bạn đã báo cáo đánh giá này. Chúng tôi sẽ xem xét nội dung."
      );
    } catch (err) {
      console.error("Lỗi khi báo cáo đánh giá", err);
    } finally {
      setReportSubmitting(false);
    }
  };

  const toggleReplies = async (reviewId) => {
    // If already expanded, just collapse
    if (expandedReplies[reviewId]) {
      setExpandedReplies({ ...expandedReplies, [reviewId]: false });
      return;
    }

    try {
      // Fetch replies for this review
      const replies = await ReviewService.getReviewReplies(reviewId);

      // Update reviews with replies
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, replies: replies } : review
        )
      );

      // Mark as expanded
      setExpandedReplies({ ...expandedReplies, [reviewId]: true });
    } catch (err) {
      console.error("Lỗi khi tải phản hồi", err);
    }
  };

  const handleReplyChange = (reviewId, text) => {
    setReplyText({ ...replyText, [reviewId]: text });
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText[reviewId]?.trim()) return;

    setReplySubmitting(true);

    try {
      const replyData = {
        content: replyText[reviewId],
      };

      const newReply = await ReviewService.addReply(reviewId, replyData);

      // Update the reviews with the new reply
      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: [...(review.replies || []), newReply],
              }
            : review
        )
      );

      // Clear the reply text
      setReplyText({ ...replyText, [reviewId]: "" });
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi", err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const renderStarRating = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderRelatedProducts = () => {
    if (relatedProductsLoading) {
      return (
        <div className="text-center py-8 text-gray-500">
          Đang tải sản phẩm liên quan...
        </div>
      );
    }

    if (relatedProducts.length === 0) {
      return null;
    }

    return (
      <AnimateWhenVisible variants={fadeInUp} className="mt-16">
        <h3 className="text-xl font-medium text-gray-800 mb-6">
          Có thể bạn cũng thích
        </h3>
        <motion.div
          variants={staggerChildren}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {relatedProducts.map((product, index) => (
            <motion.div key={product.id} variants={fadeInUp} className="h-full">
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimateWhenVisible>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12 text-red-500">
        <div className="text-5xl mb-4">⚠️</div>
        <p>{error}</p>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-12 text-gray-500">
        Không tìm thấy sản phẩm
      </div>
    );

  // Brand name - replace with actual brand from product data if available
  const brandName = product.brandName || "VDUCKTIE";

  return (
    <div className="bg-gray-50">
      {/* Success notification */}
      <div
        id="cartNotification"
        className="fixed top-6 right-6 bg-blue-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 opacity-0 flex items-center"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        Đã thêm vào giỏ hàng
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="container mx-auto px-4 py-8"
      >
        {/* Breadcrumb */}
        <motion.nav
          variants={fadeInUp}
          className="mb-6"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li className="flex items-center">
              <Link
                to="/trang-chu"
                className="hover:text-blue-600 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Trang chủ
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="flex items-center">
              <Link to="/trang-chu/san-pham" className="hover:text-blue-600">
                Sản phẩm
              </Link>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-500">{product.name}</li>
          </ol>
        </motion.nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <motion.div
              variants={fadeInUp}
              className="relative bg-white rounded-xl overflow-hidden aspect-square shadow-md"
            >
              {productImages.length > 0 ? (
                <>
                  <img
                    src={`http://localhost:8088/api/v1/product-images/get-image/${productImages[currentImageIndex]?.filename}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />

                  {/* Brand tag */}
                  <motion.div
                    variants={fadeInLeft}
                    className="absolute left-4 top-4 bg-blue-900/90 backdrop-blur-sm py-1 px-3 text-xs font-medium text-white rounded-full shadow-sm"
                  >
                    {brandName}
                  </motion.div>

                  {/* Navigation arrows */}
                  {productImages.length > 1 && (
                    <>
                      <motion.button
                        variants={fadeInLeft}
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-blue-900" />
                      </motion.button>
                      <motion.button
                        variants={fadeInLeft}
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-blue-900" />
                      </motion.button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  Không có hình ảnh
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <motion.div
                variants={staggerChildren}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              >
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    variants={fadeInUp}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-blue-600 opacity-100 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`http://localhost:8088/api/v1/product-images/get-image/${image.filename}`}
                      alt={`Hình ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Key Features */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 gap-3 mt-6 md:hidden"
            >
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-xs font-medium">Bảo hành 12 tháng</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                <Truck className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-xs font-medium">Giao hàng miễn phí</span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                <RotateCcw className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-xs font-medium">
                  Đổi trả trong 7 ngày
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-xs font-medium">Sản phẩm chính hãng</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Product Details */}
          <motion.div variants={staggerChildren} className="flex flex-col">
            <motion.div
              variants={fadeInUp}
              className="mb-2 text-sm font-medium text-blue-600 uppercase tracking-wider"
            >
              {product.categoryName || "Chưa phân loại"}
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
            >
              {product.name}
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-3 mb-4"
            >
              <div className="text-sm text-gray-600">
                Người bán:{" "}
                <span className="font-medium">{product.sellerName}</span>
              </div>

              {reviewStats.count > 0 && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    {renderStarRating(Math.round(reviewStats.average))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    ({reviewStats.count})
                  </span>
                </div>
              )}
            </motion.div>

            {/* Price */}
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-blue-900">
                  {formatPrice(product.price)}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.discountPrice)}
                  </span>
                )}
              </div>

              <div className="mt-1 text-sm">
                {product.stockQuantity > 10 ? (
                  <span className="text-green-600 font-medium">Còn hàng</span>
                ) : product.stockQuantity > 0 ? (
                  <span className="text-amber-600 font-medium">
                    Chỉ còn {product.stockQuantity} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Hết hàng</span>
                )}
              </div>
            </motion.div>

            {/* Key Features for Desktop */}
            <motion.div
              variants={fadeInUp}
              className="hidden md:grid grid-cols-2 gap-4 mb-6"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <span className="font-medium">Bảo hành 12 tháng</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <Truck className="w-6 h-6 text-blue-600 mr-3" />
                <span className="font-medium">Giao hàng miễn phí</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <RotateCcw className="w-6 h-6 text-blue-600 mr-3" />
                <span className="font-medium">Đổi trả trong 7 ngày</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <span className="font-medium">Sản phẩm chính hãng</span>
              </div>
            </motion.div>

            {/* Collapsible sections */}
            <motion.div variants={staggerChildren} className="space-y-3 mb-8">
              {/* Description */}
              <motion.div
                variants={fadeInUp}
                className="border-b border-gray-200"
              >
                <button
                  className="flex items-center justify-between w-full py-3 text-left"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  <span className="font-medium text-gray-800">
                    Mô tả sản phẩm
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showDescription ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pb-4 text-gray-600 text-sm leading-relaxed"
                  >
                    {product.description || "Không có mô tả chi tiết."}
                  </motion.div>
                )}
              </motion.div>

              {/* Specifications */}
              <motion.div
                variants={fadeInUp}
                className="border-b border-gray-200"
              >
                <button
                  className="flex items-center justify-between w-full py-3 text-left"
                  onClick={() => setShowSpecifications(!showSpecifications)}
                >
                  <span className="font-medium text-gray-800">
                    Thông số kỹ thuật
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showSpecifications ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showSpecifications && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pb-4 text-gray-600 text-sm"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-500">Chất liệu</div>
                      <div>Nhôm, Kính cường lực</div>
                      <div className="text-gray-500">Xuất xứ</div>
                      <div>Việt Nam</div>
                      <div className="text-gray-500">Kích thước</div>
                      <div>15.6 inch</div>
                      <div className="text-gray-500">Màu sắc</div>
                      <div>Đen, Bạc, Xanh</div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Shipping */}
              <motion.div
                variants={fadeInUp}
                className="border-b border-gray-200"
              >
                <button
                  className="flex items-center justify-between w-full py-3 text-left"
                  onClick={() => setShowShipping(!showShipping)}
                >
                  <span className="font-medium text-gray-800">
                    Vận chuyển & Đổi trả
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showShipping ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showShipping && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pb-4 text-gray-600 text-sm"
                  >
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Truck className="w-4 h-4 text-blue-600 mr-2" />
                        Giao hàng toàn quốc (2-5 ngày)
                      </li>
                      <li className="flex items-center">
                        <RotateCcw className="w-4 h-4 text-blue-600 mr-2" />
                        Miễn phí đổi trả trong 7 ngày
                      </li>
                      <li className="flex items-center">
                        <Shield className="w-4 h-4 text-blue-600 mr-2" />
                        Bảo hành 30 ngày với lỗi nhà sản xuất
                      </li>
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Quantity Selection */}
            <motion.div variants={fadeInUp} className="mb-6">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số lượng
              </label>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-16 h-10 text-center border-y border-gray-300 focus:outline-none"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0 || isOwnProduct}
                className={`flex-1 py-3 px-6 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                  product.stockQuantity <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isOwnProduct
                    ? "bg-blue-50 text-blue-700 border border-blue-100 cursor-not-allowed"
                    : "bg-blue-900 text-white hover:bg-blue-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isOwnProduct ? (
                  <>
                    <Info className="w-5 h-5" />
                    Không thể mua sản phẩm của bạn
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isFavorite
                    ? "bg-red-50 text-red-500 border border-red-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`}
                />
              </button>
              <button className="p-3 rounded-full flex items-center justify-center transition-all shadow-md bg-gray-100 text-gray-500 hover:bg-gray-200">
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <AnimateWhenVisible
          variants={fadeInUp}
          className="mt-16 border-t border-gray-200 pt-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-800">
              Đánh giá sản phẩm
              {reviewStats.count > 0 && (
                <span className="ml-2 text-gray-500">
                  ({reviewStats.count})
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-full hover:bg-blue-50 transition-colors"
            >
              Viết đánh giá
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6 mb-8"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Chia sẻ trải nghiệm của bạn
              </h3>

              {isOwnProduct ? (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-md mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>Bạn không thể đánh giá sản phẩm của chính mình.</p>
                </div>
              ) : reviewError ? (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {reviewError}
                </div>
              ) : null}

              {!isOwnProduct && (
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá của bạn
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= newReview.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="review-comment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nhận xét chi tiết
                    </label>
                    <textarea
                      id="review-comment"
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                      rows="4"
                      required
                      minLength={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tối thiểu 10 ký tự
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <motion.div variants={staggerChildren} className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  variants={fadeInUp}
                  custom={index}
                  className="bg-white p-5 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.userName || "Người dùng ẩn danh"}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {renderStarRating(review.rating)}
                        </div>
                        {review.createdAt && (
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {review.verified && (
                      <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Đã mua hàng
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-gray-600 text-sm">{review.comment}</p>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleLikeReview(review.id)}
                      className={`flex items-center text-xs ${
                        likedReviews.includes(review.id)
                          ? "text-blue-600 font-medium"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 mr-1 ${
                          likedReviews.includes(review.id)
                            ? "fill-blue-600"
                            : ""
                        }`}
                      />
                      Hữu ích ({review.helpfulCount || 0})
                    </button>
                    <button
                      onClick={() => handleReportClick(review.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      <Flag className="w-3.5 h-3.5 mr-1" />
                      Báo cáo
                    </button>
                    <button
                      onClick={() => toggleReplies(review.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      {expandedReplies[review.id]
                        ? "Ẩn phản hồi"
                        : "Xem phản hồi"}
                    </button>
                  </div>

                  {/* Review Replies */}
                  {expandedReplies[review.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pl-4 border-l-2 border-blue-100"
                    >
                      {review.replies && review.replies.length > 0 ? (
                        <div className="space-y-3">
                          {review.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-gray-50 p-3 rounded-md"
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-gray-800 text-xs">
                                  {reply.isAdmin ? (
                                    <span className="text-blue-600">
                                      Người bán
                                    </span>
                                  ) : (
                                    reply.userName || "Người dùng"
                                  )}
                                </p>
                                {reply.createdAt && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      reply.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-gray-600 text-xs">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Chưa có phản hồi nào.
                        </p>
                      )}

                      {/* Reply Form */}
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText[review.id] || ""}
                            onChange={(e) =>
                              handleReplyChange(review.id, e.target.value)
                            }
                            placeholder="Viết phản hồi của bạn..."
                            className="flex-1 text-xs p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={
                              replySubmitting || !replyText[review.id]?.trim()
                            }
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            Gửi
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {/* Pagination */}
              <motion.div
                variants={fadeInUp}
                className="flex justify-center mt-8"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                  className="px-4 py-2 mx-1 rounded-full border border-gray-300 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={reviews.length < reviewsPerPage}
                  className="px-4 py-2 mx-1 rounded-full border border-gray-300 text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeInUp}
              className="bg-white p-8 rounded-lg text-center shadow-md"
            >
              <p className="text-gray-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-4 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm"
              >
                Viết đánh giá đầu tiên
              </button>
            </motion.div>
          )}
        </AnimateWhenVisible>

        {/* Related Products */}
        {renderRelatedProducts()}
      </motion.div>

      {/* Report Review Modal */}
      {reportModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Báo cáo đánh giá
            </h3>

            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do báo cáo
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn lý do --</option>
                  <option value="spam">Spam hoặc quảng cáo</option>
                  <option value="inappropriate">Nội dung không phù hợp</option>
                  <option value="fake">Đánh giá giả mạo</option>
                  <option value="offensive">Ngôn ngữ xúc phạm</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>

              {reportReason === "other" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chi tiết
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    setReportReason("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportReason}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {reportSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductDetail;
