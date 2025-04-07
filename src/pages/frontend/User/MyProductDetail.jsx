"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  Package,
  ShoppingBag,
  Star,
  StarHalf,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ProductService from "../../../api/ProductService";
import ReviewService from "../../../api/ReviewService";
import OrderService from "../../../api/OrderService";

const MyProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState({
    totalSold: 0,
    totalRevenue: 0,
    netRevenue: 0,
    shopTax: 0,
    recentOrders: [],
  });
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });
  const [timeRange, setTimeRange] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const productData = await ProductService.getProductById(
          Number(productId)
        );
        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Fetch sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);

        // Get all orders
        const orders = await OrderService.getAllOrder();

        // Filter orders containing this product
        const productOrders = orders.filter(
          (order) =>
            order.orderDetails &&
            order.orderDetails.some(
              (item) => item.productId === Number.parseInt(productId)
            )
        );

        // Filter by date range if needed
        let filteredOrders = productOrders;
        if (
          timeRange === "custom" &&
          dateRange.startDate &&
          dateRange.endDate
        ) {
          filteredOrders = productOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return (
              orderDate >= new Date(dateRange.startDate) &&
              orderDate <= new Date(dateRange.endDate)
            );
          });
        } else if (timeRange === "month") {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          filteredOrders = productOrders.filter(
            (order) => new Date(order.createdAt) >= monthStart
          );
        } else if (timeRange === "week") {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          filteredOrders = productOrders.filter(
            (order) => new Date(order.createdAt) >= weekStart
          );
        }

        // Calculate total sold and revenue
        let totalSold = 0;
        let totalRevenue = 0;

        filteredOrders.forEach((order) => {
          order.orderDetails.forEach((item) => {
            if (item.productId === Number.parseInt(productId)) {
              totalSold += item.quantity;
              totalRevenue += item.price * item.quantity;
            }
          });
        });

        // Calculate shop tax (25%) and net revenue
        const shopTax = totalRevenue * 0.25;
        const netRevenue = totalRevenue - shopTax;

        setSalesData({
          totalSold,
          totalRevenue,
          netRevenue,
          shopTax,
          recentOrders: filteredOrders.slice(0, 5), // Get 5 most recent orders
        });
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("Không thể tải dữ liệu bán hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSalesData();
    }
  }, [productId, timeRange, dateRange]);

  // Fetch review statistics
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        if (!productId) return;

        // Get product rating statistics
        const stats = await ReviewService.getProductRatingStats(
          Number.parseInt(productId)
        );

        // Get reviews for the product
        const reviews = await ReviewService.getProductReviews(
          Number.parseInt(productId),
          { page: 0, size: 100 }
        );

        // Count ratings by star level
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (reviews && reviews.content) {
          reviews.content.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
              ratingCounts[review.rating]++;
            }
          });
        }

        setReviewStats({
          averageRating: stats?.averageRating || 0,
          totalReviews: stats?.totalReviews || 0,
          ratingCounts,
        });
      } catch (err) {
        console.error("Error fetching review statistics:", err);
      }
    };

    fetchReviewStats();
  }, [productId]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Render star rating
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 fill-amber-400 text-amber-400"
          />
        ))}
        {hasHalfStar && (
          <StarHalf className="w-5 h-5 fill-amber-400 text-amber-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
      </div>
    );
  };

  // Calculate percentage for rating bar
  const calculateRatingPercentage = (ratingCount) => {
    if (reviewStats.totalReviews === 0) return 0;
    return (ratingCount / reviewStats.totalReviews) * 100;
  };

  // Loading state
  if (loading && !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-2/4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 h-64 animate-pulse"></div>
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              to="/trang-chu"
              className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              to="/trang-chu/san-pham"
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              Sản phẩm
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-800 font-medium">Thống kê bán hàng</li>
        </ol>
      </nav>

      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/trang-chu/nguoi-dung/san-pham"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách sản phẩm
        </Link>
      </div>

      {/* Product Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white rounded-xl shadow-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Thống kê bán hàng
            </h1>
            <p className="text-indigo-100 mt-1">
              {product?.name || "Thông tin sản phẩm"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/trang-chu/san-pham/chi-tiet-san-pham/${productId}`}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors shadow-md flex items-center"
            >
              <Eye className="w-5 h-5 mr-2" /> Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>

      {/* Product Info and Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thông tin sản phẩm
            </h2>
            <div className="flex items-center mb-4">
              <img
                className="h-48 w-48 object-cover"
                src={
                  product?.imageUrl
                    ? `http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`
                    : "https://placehold.co/600x400/EEE/31343C"
                }
                alt={product?.name || "Product Image"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400/EEE/31343C";
                }}
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{product?.name}</h3>
                <p className="text-gray-500 text-sm mt-1">ID: {product?.id}</p>
                <p className="text-gray-500 text-sm mt-1 flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1" />
                  {product?.categoryName || "Chưa phân loại"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Giá bán:</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(product?.price || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tồn kho:</p>
                <p className="font-medium text-gray-900">
                  {product?.stockQuantity || 0} sản phẩm
                </p>
              </div>
              <div>
                <p className="text-gray-500">Trạng thái:</p>
                <p className="font-medium">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product?.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : product?.status === "INACTIVE"
                        ? "bg-gray-100 text-gray-800"
                        : product?.status === "OUT_OF_STOCK"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product?.status === "ACTIVE"
                      ? "Đang bán"
                      : product?.status === "INACTIVE"
                      ? "Đã ẩn"
                      : product?.status === "OUT_OF_STOCK"
                      ? "Hết hàng"
                      : "Chờ duyệt"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-500">Ngày tạo:</p>
                <p className="font-medium text-gray-900">
                  {product?.createdAt ? formatDate(product.createdAt) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Statistics */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Thống kê bán hàng
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTimeRangeChange("all")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "all"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => handleTimeRangeChange("month")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "month"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tháng này
                </button>
                <button
                  onClick={() => handleTimeRangeChange("week")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "week"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tuần này
                </button>
                <button
                  onClick={() => handleTimeRangeChange("custom")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === "custom"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tùy chỉnh
                </button>
              </div>
            </div>

            {timeRange === "custom" && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Từ:</span>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Đến:</span>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-600 text-sm font-medium">
                      Đã bán
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {salesData.totalSold}
                    </h3>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Tổng số sản phẩm đã bán
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Doanh thu
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(salesData.totalRevenue)}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Tổng doanh thu từ sản phẩm
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">
                      Thuế shop
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(salesData.shopTax)}
                    </h3>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  25% doanh thu trả cho shop
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">
                      Thu nhập
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(salesData.netRevenue)}
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Doanh thu sau khi trừ thuế
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Đơn hàng gần đây
              </h3>
              {salesData.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Mã đơn hàng
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ngày đặt
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Số lượng
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Giá bán
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesData.recentOrders.map((order) => {
                        // Find the product in this order
                        const orderItem = order.orderDetails.find(
                          (item) =>
                            item.productId === Number.parseInt(productId)
                        );
                        if (!orderItem) return null;

                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                              #{order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {orderItem.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(orderItem.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {formatCurrency(
                                orderItem.price * orderItem.quantity
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Chưa có đơn hàng nào trong khoảng thời gian này
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Star className="w-5 h-5 mr-2 text-amber-400" />
            Thống kê đánh giá
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Đánh giá trung bình
              </h3>
              <div className="text-5xl font-bold text-amber-500 mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStarRating(reviewStats.averageRating)}
              </div>
              <p className="text-gray-500 text-sm">
                Dựa trên {reviewStats.totalReviews} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Phân bố đánh giá
              </h3>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-24">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        {rating}
                      </span>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-4 mx-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${calculateRatingPercentage(
                            reviewStats.ratingCounts[rating]
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm text-gray-500">
                        {reviewStats.ratingCounts[rating]} (
                        {calculateRatingPercentage(
                          reviewStats.ratingCounts[rating]
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Đánh giá 5 sao:</p>
                    <p className="font-medium text-green-600">
                      {calculateRatingPercentage(
                        reviewStats.ratingCounts[5]
                      ).toFixed(1)}
                      % khách hàng
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Đánh giá tích cực (4-5 sao):
                    </p>
                    <p className="font-medium text-blue-600">
                      {calculateRatingPercentage(
                        reviewStats.ratingCounts[4] +
                          reviewStats.ratingCounts[5]
                      ).toFixed(1)}
                      % khách hàng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Review Metrics */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Chỉ số đánh giá chi tiết
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">
                  Đánh giá tích cực (4-5 sao)
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {reviewStats.ratingCounts[4] + reviewStats.ratingCounts[5]}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">
                  Đánh giá trung bình (3 sao)
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {reviewStats.ratingCounts[3]}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">
                  Đánh giá tiêu cực (1-2 sao)
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {reviewStats.ratingCounts[1] + reviewStats.ratingCounts[2]}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 text-sm">Tỷ lệ hài lòng</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {reviewStats.totalReviews > 0
                    ? (
                        ((reviewStats.ratingCounts[4] +
                          reviewStats.ratingCounts[5]) /
                          reviewStats.totalReviews) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Phân tích doanh thu
            </h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    Doanh thu
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    100%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: "100%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                ></div>
              </div>

              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                    Thuế shop (25%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-amber-600">
                    25%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-200">
                <div
                  style={{ width: "25%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"
                ></div>
              </div>

              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                    Thu nhập ròng
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    75%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: "75%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                ></div>
              </div>
            </div>

            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Tổng doanh thu</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(salesData.totalRevenue)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Thuế shop (25%)</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(salesData.shopTax)}
                  </p>
                </div>
                <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                  <p className="text-indigo-600 text-sm font-medium">
                    Thu nhập ròng (75%)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(salesData.netRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Metrics */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Chỉ số bán hàng
              </h2>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">Tổng số đã bán</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {salesData.totalSold} sản phẩm
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">
                      Doanh thu trung bình mỗi đơn
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {salesData.totalSold > 0
                        ? formatCurrency(
                            salesData.totalRevenue /
                              salesData.recentOrders.length
                          )
                        : formatCurrency(0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">Khoảng thời gian</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {timeRange === "all"
                        ? "Tất cả thời gian"
                        : timeRange === "month"
                        ? "Tháng này"
                        : timeRange === "week"
                        ? "Tuần này"
                        : "Tùy chỉnh"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Truck className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">Số đơn hàng</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {salesData.recentOrders.length} đơn hàng
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-sm">
                    Tỷ lệ doanh thu/tồn kho:
                  </p>
                  <p className="text-sm font-medium">
                    {product?.stockQuantity > 0
                      ? `${Math.round(
                          (salesData.totalSold /
                            (salesData.totalSold + product.stockQuantity)) *
                            100
                        )}%`
                      : "100%"}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{
                      width:
                        product?.stockQuantity > 0
                          ? `${Math.round(
                              (salesData.totalSold /
                                (salesData.totalSold + product.stockQuantity)) *
                                100
                            )}%`
                          : "100%",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tỷ lệ số lượng đã bán so với tổng số lượng (đã bán + còn lại)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Đề xuất</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="ml-2 font-medium text-gray-900">
                    Tối ưu giá bán
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {salesData.totalSold > 10
                    ? "Sản phẩm bán chạy, có thể cân nhắc tăng giá để tối ưu lợi nhuận."
                    : "Xem xét điều chỉnh giá để tăng doanh số bán hàng."}
                </p>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="ml-2 font-medium text-gray-900">
                    Quản lý tồn kho
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {product?.stockQuantity < 10
                    ? "Tồn kho thấp, cần nhập thêm hàng để đáp ứng nhu cầu."
                    : product?.stockQuantity > 50 && salesData.totalSold < 5
                    ? "Tồn kho cao, cân nhắc giảm giá để tăng doanh số."
                    : "Tồn kho ở mức hợp lý."}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="ml-2 font-medium text-gray-900">Tiếp thị</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {salesData.totalSold < 5
                    ? "Cân nhắc tăng cường quảng cáo để tiếp cận nhiều khách hàng hơn."
                    : "Sản phẩm có lượng bán tốt, tiếp tục duy trì chiến lược tiếp thị."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to={`/trang-chu/nguoi-dung/san-pham/${
              Number.parseInt(productId) - 1
            }/thong-ke`}
            className={`flex items-center px-4 py-2 text-sm rounded-lg ${
              Number.parseInt(productId) <= 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={(e) =>
              Number.parseInt(productId) <= 1 && e.preventDefault()
            }
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Sản phẩm trước
          </Link>

          <Link
            to={`/trang-chu/nguoi-dung/san-pham/${
              Number.parseInt(productId) + 1
            }/thong-ke`}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Sản phẩm tiếp theo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyProductDetail;
