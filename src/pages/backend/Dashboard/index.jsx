"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  DollarSign,
  ShoppingBag,
  Users,
  Star,
  ArrowUp,
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Grid,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  StarIcon,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Chart from "chart.js/auto";

// Import services
import WebsiteRevenueService from "../../../api/WebsiteRevenueService";
import UserService from "../../../api/UserService";
import ProductService from "../../../api/ProductService";
import ReviewService from "../../../api/ReviewService";
import OrderService from "../../../api/OrderService";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const AdminDashboard = () => {
  // State for sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

  // State for statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [showFilters, setShowFilters] = useState(false);

  // Animation state
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Date range for orders
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Pagination for products
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Order status filter
  const [orderStatus, setOrderStatus] = useState("");

  // Chart references
  const revenueChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const orderStatusChartRef = useRef(null);

  // Set page as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch total revenue
        const revenueResponse = await WebsiteRevenueService.getTotalRevenue();
        setTotalRevenue(revenueResponse || 0);

        // Fetch revenue data with pagination
        const revenueDataResponse = await WebsiteRevenueService.getAllRevenue({
          page: 0,
          size: 10,
        });
        setRevenueData(revenueDataResponse?.content || []);

        // Fetch users
        const usersResponse = await UserService.getAllUsers();
        setUsers(usersResponse || []);

        // Fetch products with pagination
        const productsResponse = await ProductService.getAllProducts(
          keyword,
          status,
          categoryId,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          page,
          size
        );
        setProducts(productsResponse?.content || []);
        setTotalItems(productsResponse?.totalElements || 0);

        // Fetch reviews
        const reviewsResponse = await ReviewService.getAllReviews();
        setReviews(
          Array.isArray(reviewsResponse.content) ? reviewsResponse.content : []
        );

        // Fetch orders
        const ordersResponse = await OrderService.getAllOrder();
        setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [page, size, keyword, status, categoryId]);

  // Fetch orders by date range
  const fetchOrdersByDateRange = async () => {
    try {
      setLoading(true);
      const ordersResponse = await OrderService.getOrdersByDateRange(
        startDate,
        endDate
      );
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders by date range:", err);
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders by status
  const fetchOrdersByStatus = async () => {
    if (!orderStatus) return;

    try {
      setLoading(true);
      const ordersResponse = await OrderService.getOrdersByStatus(orderStatus);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders by status:", err);
      setError("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize charts when data is loaded
  useEffect(() => {
    if (!loading && orders.length > 0) {
      initializeRevenueChart();
      initializeCategoryChart();
      initializeOrderStatusChart();
    }
  }, [loading, orders, timeRange]);

  // Initialize revenue chart
  const initializeRevenueChart = () => {
    if (revenueChartRef.current) {
      // Destroy existing chart
      if (revenueChartRef.current.chart) {
        revenueChartRef.current.chart.destroy();
      }

      // Process data based on time range
      const processedData = processRevenueDataByTimeRange(orders, timeRange);

      // Create new chart
      const ctx = revenueChartRef.current.getContext("2d");
      revenueChartRef.current.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: processedData.labels,
          datasets: [
            {
              label: "Doanh thu",
              data: processedData.data,
              backgroundColor: "rgba(236, 72, 153, 0.2)",
              borderColor: "rgba(236, 72, 153, 1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: "rgba(236, 72, 153, 1)",
              pointBorderColor: "#fff",
              pointBorderWidth: 1,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(17, 24, 39, 0.9)",
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(75, 85, 99, 0.3)",
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (context) => formatCurrency(context.parsed.y),
              },
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(75, 85, 99, 0.2)",
              },
              ticks: {
                color: "rgba(156, 163, 175, 1)",
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(75, 85, 99, 0.2)",
              },
              ticks: {
                color: "rgba(156, 163, 175, 1)",
                callback: (value) => {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + "M";
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(0) + "K";
                  }
                  return value;
                },
              },
            },
          },
        },
      });
    }
  };

  // Initialize category chart
  const initializeCategoryChart = () => {
    if (categoryChartRef.current) {
      // Destroy existing chart
      if (categoryChartRef.current.chart) {
        categoryChartRef.current.chart.destroy();
      }

      // Process data for categories
      const categoryData = processCategoryData(orders, products);

      // Create new chart
      const ctx = categoryChartRef.current.getContext("2d");
      categoryChartRef.current.chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: categoryData.labels,
          datasets: [
            {
              data: categoryData.data,
              backgroundColor: [
                "rgba(236, 72, 153, 0.8)",
                "rgba(124, 58, 237, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
              ],
              borderColor: "rgba(31, 41, 55, 1)",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                color: "rgba(156, 163, 175, 1)",
                padding: 15,
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            tooltip: {
              backgroundColor: "rgba(17, 24, 39, 0.9)",
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(75, 85, 99, 0.3)",
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: (context) => {
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${context.label}: ${formatCurrency(
                    value
                  )} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }
  };

  // Initialize order status chart
  const initializeOrderStatusChart = () => {
    if (orderStatusChartRef.current) {
      // Destroy existing chart
      if (orderStatusChartRef.current.chart) {
        orderStatusChartRef.current.chart.destroy();
      }

      // Process data for order status
      const statusData = processOrderStatusData(orders);

      // Create new chart
      const ctx = orderStatusChartRef.current.getContext("2d");
      orderStatusChartRef.current.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: statusData.labels,
          datasets: [
            {
              label: "Số lượng đơn hàng",
              data: statusData.data,
              backgroundColor: [
                "rgba(16, 185, 129, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(239, 68, 68, 0.8)",
              ],
              borderColor: [
                "rgba(16, 185, 129, 1)",
                "rgba(245, 158, 11, 1)",
                "rgba(59, 130, 246, 1)",
                "rgba(239, 68, 68, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: "rgba(17, 24, 39, 0.9)",
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(75, 85, 99, 0.3)",
              borderWidth: 1,
              padding: 12,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "rgba(156, 163, 175, 1)",
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(75, 85, 99, 0.2)",
              },
              ticks: {
                color: "rgba(156, 163, 175, 1)",
                precision: 0,
              },
            },
          },
        },
      });
    }
  };

  // Process revenue data by time range
  const processRevenueDataByTimeRange = (orders, timeRange) => {
    const labels = [];
    const data = [];

    if (!Array.isArray(orders) || orders.length === 0) {
      return { labels: [], data: [] };
    }

    // Sort orders by date
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(a.orderDate) - new Date(b.orderDate)
    );

    // Group by time range
    const groupedData = {};

    if (timeRange === "day") {
      // Group by hour
      for (let i = 0; i < 24; i++) {
        const hour = i < 10 ? `0${i}:00` : `${i}:00`;
        labels.push(hour);
        groupedData[hour] = 0;
      }

      sortedOrders.forEach((order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          const today = new Date();

          if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            const hour = date.getHours();
            const hourStr = hour < 10 ? `0${hour}:00` : `${hour}:00`;
            groupedData[hourStr] += order.totalAmount || 0;
          }
        }
      });
    } else if (timeRange === "week") {
      // Group by day of week
      const days = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];
      days.forEach((day) => {
        labels.push(day);
        groupedData[day] = 0;
      });

      sortedOrders.forEach((order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          const now = new Date();
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);

          if (date >= oneWeekAgo && date <= now) {
            const dayOfWeek = date.getDay();
            groupedData[days[dayOfWeek]] += order.totalAmount || 0;
          }
        }
      });
    } else if (timeRange === "month") {
      // Group by week of month
      const weeks = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5"];
      weeks.forEach((week) => {
        labels.push(week);
        groupedData[week] = 0;
      });

      sortedOrders.forEach((order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          const now = new Date();
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);

          if (date >= oneMonthAgo && date <= now) {
            // Calculate week of month
            const day = date.getDate();
            let weekOfMonth = Math.ceil(day / 7);
            if (weekOfMonth > 5) weekOfMonth = 5;

            groupedData[`Tuần ${weekOfMonth}`] += order.totalAmount || 0;
          }
        }
      });
    } else if (timeRange === "year") {
      // Group by month
      const months = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      months.forEach((month) => {
        labels.push(month);
        groupedData[month] = 0;
      });

      sortedOrders.forEach((order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate);
          const now = new Date();

          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth();
            groupedData[months[month]] += order.totalAmount || 0;
          }
        }
      });
    }

    // Convert grouped data to array
    labels.forEach((label) => {
      data.push(groupedData[label]);
    });

    return { labels, data };
  };

  // Process category data
  const processCategoryData = (orders, products) => {
    const categoryRevenue = {};
    const labels = [];
    const data = [];

    if (
      !Array.isArray(orders) ||
      orders.length === 0 ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return { labels: ["Không có dữ liệu"], data: [100] };
    }

    // Create a map of product ID to category
    const productCategories = {};
    products.forEach((product) => {
      if (product.id && product.categoryName) {
        productCategories[product.id] = product.categoryName;
      }
    });

    // Calculate revenue by category
    orders.forEach((order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach((item) => {
          const categoryName = productCategories[item.productId] || "Khác";
          const itemTotal = (item.price || 0) * (item.quantity || 0);

          if (!categoryRevenue[categoryName]) {
            categoryRevenue[categoryName] = 0;
          }

          categoryRevenue[categoryName] += itemTotal;
        });
      }
    });

    // If no categories found, return placeholder
    if (Object.keys(categoryRevenue).length === 0) {
      return { labels: ["Không có dữ liệu"], data: [100] };
    }

    // Convert to arrays for chart
    Object.entries(categoryRevenue)
      .sort((a, b) => b[1] - a[1]) // Sort by revenue (highest first)
      .forEach(([category, revenue]) => {
        labels.push(category);
        data.push(revenue);
      });

    return { labels, data };
  };

  // Process order status data
  const processOrderStatusData = (orders) => {
    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    if (!Array.isArray(orders) || orders.length === 0) {
      return {
        labels: ["Chờ xử lý", "Đang xử lý", "Hoàn thành", "Đã hủy"],
        data: [0, 0, 0, 0],
      };
    }

    // Count orders by status
    orders.forEach((order) => {
      const status = order.status || "PENDING";
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    return {
      labels: ["Chờ xử lý", "Đang xử lý", "Hoàn thành", "Đã hủy"],
      data: [
        statusCounts.PENDING,
        statusCounts.PROCESSING,
        statusCounts.DELIVERED,
        statusCounts.CANCELLED,
      ],
    };
  };

  // Calculate statistics
  const activeUsers = users.filter((user) => user?.status === "ACTIVE").length;
  const pendingProducts = products.filter(
    (product) => product?.status === "PENDING"
  ).length;
  const averageRating =
    Array.isArray(reviews) && reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + (review?.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  // Calculate order statistics
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const completedOrders = Array.isArray(orders)
    ? orders.filter((order) => order.status === "DELIVERED").length
    : 0;
  const pendingOrders = Array.isArray(orders)
    ? orders.filter((order) => order.status === "PENDING").length
    : 0;
  const cancelledOrders = Array.isArray(orders)
    ? orders.filter((order) => order.status === "CANCELLED").length
    : 0;

  // Calculate total revenue from orders
  const orderRevenue = Array.isArray(orders)
    ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  // Handle date range search
  const handleDateRangeSearch = (e) => {
    e.preventDefault();
    fetchOrdersByDateRange();
  };

  // Handle order status change
  const handleOrderStatusChange = (e) => {
    setOrderStatus(e.target.value);
    if (e.target.value) {
      fetchOrdersByStatus();
    } else {
      // If no status selected, fetch all orders
      const fetchAllOrders = async () => {
        try {
          const ordersResponse = await OrderService.getAllOrder();
          setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
        } catch (err) {
          console.error("Error fetching all orders:", err);
        }
      };
      fetchAllOrders();
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, { status: newStatus });
      // Refresh orders after update
      const ordersResponse = await OrderService.getAllOrder();
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      // Show success message
      alert(`Đã cập nhật trạng thái đơn hàng #${orderId} thành ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Lỗi khi cập nhật trạng thái đơn hàng: ${err.message}`);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        await OrderService.cancelOrder(orderId);
        // Refresh orders after cancellation
        const ordersResponse = await OrderService.getAllOrder();
        setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
        // Show success message
        alert(`Đã hủy đơn hàng #${orderId}`);
      } catch (err) {
        console.error("Error cancelling order:", err);
        alert(`Lỗi khi hủy đơn hàng: ${err.message}`);
      }
    }
  };

  // Handle pagination
  const totalPages = Math.ceil(totalItems / size);

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={fadeInLeft}
      >
        <motion.div
          className="flex items-center justify-between h-16 px-4 border-b border-gray-700"
          variants={fadeInDown}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-600 rounded-md flex items-center justify-center mr-2">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              FASHION<span className="text-pink-500">ADMIN</span>
            </span>
          </div>
          <button
            className="p-1 rounded-md lg:hidden hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>

        <div className="py-4">
          <motion.div className="px-4 mb-6" variants={fadeInUp}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <div className="font-medium">Admin User</div>
                <div className="text-sm text-gray-400">admin@fashion.com</div>
              </div>
            </div>
          </motion.div>

          <motion.nav className="px-2 space-y-1" variants={staggerContainer}>
            {[
              { name: "Tổng Quan", icon: Grid, tab: "overview" },
              { name: "Đơn Hàng", icon: ShoppingCart, tab: "orders" },
              { name: "Sản Phẩm", icon: ShoppingBag, tab: "products" },
              { name: "Người Dùng", icon: Users, tab: "users" },
              { name: "Đánh giá", icon: StarIcon, tab: "reviews" },
              { name: "Doanh Thu", icon: DollarSign, tab: "revenue" },
              { name: "Cài Đặt", icon: Settings, tab: "settings" },
            ].map((item, index) => (
              <motion.button
                key={item.tab}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === item.tab
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setActiveTab(item.tab)}
                variants={fadeInLeft}
                custom={index}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </motion.button>
            ))}
          </motion.nav>

          <motion.div
            className="px-4 mt-8 pt-6 border-t border-gray-700"
            variants={fadeInUp}
          >
            <button className="flex items-center w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md">
              <LogOut className="w-5 h-5 mr-3" />
              <span>Đăng Xuất</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <motion.header
          className="bg-gray-800 border-b border-gray-700"
          initial="hidden"
          animate={isPageLoaded ? "visible" : "hidden"}
          variants={fadeInDown}
        >
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                className="p-1 mr-3 rounded-md lg:hidden hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold">Bảng Điều Khiển</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-gray-700 relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
                </button>
              </div>

              <div className="relative">
                <select
                  className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1.5 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="day">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="year">Năm nay</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-900">
          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-md mb-6"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {error}
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
            variants={staggerContainer}
            initial="hidden"
            animate={isPageLoaded ? "visible" : "hidden"}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
              variants={fadeInUp}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 text-sm font-medium">
                  Tổng Doanh Thu
                </h3>
                <div className="p-2 bg-pink-500/10 rounded-md">
                  <DollarSign className="w-5 h-5 text-pink-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(orderRevenue || totalRevenue)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">20.1%</span>
                <span className="text-gray-400 ml-1">so với tháng trước</span>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
              variants={fadeInUp}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Đơn Hàng</h3>
                <div className="p-2 bg-blue-500/10 rounded-md">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{totalOrders}</div>
              <div className="text-gray-400 mt-2 text-sm">
                {completedOrders} đơn hàng hoàn thành, {pendingOrders} đang chờ
                xử lý
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
              variants={fadeInUp}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Sản Phẩm</h3>
                <div className="p-2 bg-purple-500/10 rounded-md">
                  <ShoppingBag className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{totalItems}</div>
              <div className="text-gray-400 mt-2 text-sm">
                {pendingProducts} sản phẩm đang chờ duyệt
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
              variants={fadeInUp}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 text-sm font-medium">
                  Đánh Giá Trung Bình
                </h3>
                <div className="p-2 bg-yellow-500/10 rounded-md">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {averageRating}/5
              </div>
              <div className="text-gray-400 mt-2 text-sm">
                Dựa trên {reviews.length} đánh giá
              </div>
            </motion.div>
          </motion.div>

          {/* Tab Content */}
          <div className="mb-6">
            <motion.div
              className="border-b border-gray-700 mb-6"
              initial="hidden"
              animate={isPageLoaded ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <div className="flex overflow-x-auto hide-scrollbar">
                <button
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "overview"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Tổng Quan
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "orders"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  Đơn Hàng
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "products"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  Sản Phẩm
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "users"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("users")}
                >
                  Người Dùng
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "reviews"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Đánh Giá
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "revenue"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("revenue")}
                >
                  Doanh Thu
                </button>
              </div>
            </motion.div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {/* Revenue Chart */}
                <motion.div
                  className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                  variants={fadeInUp}
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-1">
                      Doanh Thu Theo Thời Gian
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                      Biểu đồ doanh thu theo{" "}
                      {timeRange === "day"
                        ? "giờ"
                        : timeRange === "week"
                        ? "ngày"
                        : timeRange === "month"
                        ? "tuần"
                        : "tháng"}
                    </p>
                    <div className="h-[300px] w-full">
                      <canvas ref={revenueChartRef}></canvas>
                    </div>
                  </div>
                </motion.div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Products */}
                  <motion.div
                    className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                    variants={fadeInLeft}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        Sản Phẩm Bán Chạy
                      </h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Top 5 sản phẩm bán chạy nhất
                      </p>

                      <motion.div
                        className="space-y-4"
                        variants={staggerContainer}
                      >
                        {products.slice(0, 5).map((product, index) => (
                          <motion.div
                            key={product?.id || index}
                            className="flex items-center"
                            variants={fadeInUp}
                            custom={index}
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-4 text-pink-500 font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">
                                {product?.name || "Sản phẩm thời trang"}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {formatCurrency(product?.price || 0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">
                                {Math.floor(Math.random() * 100)} đã bán
                              </p>
                              <p className="text-gray-400 text-sm">Tháng này</p>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Order Status Distribution */}
                  <motion.div
                    className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                    variants={fadeInRight}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        Trạng Thái Đơn Hàng
                      </h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Phân bố đơn hàng theo trạng thái
                      </p>

                      <div className="h-[250px] w-full">
                        <canvas ref={orderStatusChartRef}></canvas>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Three Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Revenue by Category */}
                  <motion.div
                    className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                    variants={fadeInUp}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        Doanh Thu Theo Danh Mục
                      </h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Phân bố doanh thu theo danh mục sản phẩm
                      </p>
                      <div className="h-[200px] w-full">
                        <canvas ref={categoryChartRef}></canvas>
                      </div>
                    </div>
                  </motion.div>

                  {/* New Users */}
                  <motion.div
                    className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                    variants={fadeInUp}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        Người Dùng Mới
                      </h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Số lượng người dùng đăng ký mới
                      </p>
                      <div className="h-[200px] w-full flex items-center justify-center">
                        <BarChart className="w-16 h-16 text-gray-600" />
                        <p className="text-gray-500 ml-4">
                          Biểu đồ người dùng mới sẽ hiển thị ở đây
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                    variants={fadeInUp}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-1">
                        Hoạt Động Gần Đây
                      </h2>
                      <p className="text-gray-400 text-sm mb-6">
                        Các hoạt động mới nhất trong hệ thống
                      </p>

                      <motion.div
                        className="space-y-4"
                        variants={staggerContainer}
                      >
                        <motion.div className="flex" variants={fadeInUp}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4">
                            <Package className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              Sản phẩm mới được thêm
                            </p>
                            <p className="text-gray-400 text-sm">
                              Người dùng A đã thêm sản phẩm "Áo Thời Trang XYZ"
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              2 giờ trước
                            </p>
                          </div>
                        </motion.div>

                        <div className="w-full h-px bg-gray-700 my-2"></div>

                        <motion.div className="flex" variants={fadeInUp}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              Đơn hàng mới
                            </p>
                            <p className="text-gray-400 text-sm">
                              Đơn hàng #1234 đã được tạo
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              3 giờ trước
                            </p>
                          </div>
                        </motion.div>

                        <div className="w-full h-px bg-gray-700 my-2"></div>

                        <motion.div className="flex" variants={fadeInUp}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4">
                            <Star className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              Đánh giá mới
                            </p>
                            <p className="text-gray-400 text-sm">
                              Người dùng C đã đánh giá sản phẩm "Váy Thời Trang
                              ABC"
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              5 giờ trước
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                  variants={fadeInUp}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Quản Lý Đơn Hàng
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Xem và quản lý tất cả đơn hàng trong hệ thống
                        </p>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                      <button
                        className="flex items-center text-gray-400 hover:text-white mb-4"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                        {showFilters ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </button>

                      <AnimatePresence>
                        {showFilters && (
                          <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative">
                              <select
                                value={orderStatus}
                                onChange={handleOrderStatusChange}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              >
                                <option value="">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="PROCESSING">Đang xử lý</option>
                                <option value="DELIVERED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <input
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleDateRangeSearch}
                              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                            >
                              Áp dụng bộ lọc
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Orders Table */}
                    <motion.div className="overflow-x-auto" variants={fadeInUp}>
                      <table className="w-full text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Mã ĐH</th>
                            <th className="px-4 py-3">Khách hàng</th>
                            <th className="px-4 py-3">Ngày đặt</th>
                            <th className="px-4 py-3">Tổng tiền</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3 rounded-tr-lg">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <motion.tbody
                          className="divide-y divide-gray-700"
                          variants={staggerContainer}
                        >
                          {Array.isArray(orders) && orders.length > 0 ? (
                            orders.map((order, index) => (
                              <motion.tr
                                key={order?.id || index}
                                className="bg-gray-800 hover:bg-gray-750"
                                variants={fadeInUp}
                                custom={index}
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  #{order?.id || index + 1}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                      <User className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-white">
                                        {order?.customerName || "Khách hàng"}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {order?.customerEmail ||
                                          "email@example.com"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                                  {formatDate(order?.orderDate)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-pink-400 font-medium">
                                  {formatCurrency(order?.totalAmount || 0)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      order?.status === "DELIVERED"
                                        ? "bg-green-900/50 text-green-400 border border-green-500/30"
                                        : order?.status === "PROCESSING"
                                        ? "bg-blue-900/50 text-blue-400 border border-blue-500/30"
                                        : order?.status === "PENDING"
                                        ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                                        : "bg-red-900/50 text-red-400 border border-red-500/30"
                                    }`}
                                  >
                                    {order?.status === "DELIVERED"
                                      ? "Hoàn thành"
                                      : order?.status === "PROCESSING"
                                      ? "Đang xử lý"
                                      : order?.status === "PENDING"
                                      ? "Chờ xử lý"
                                      : "Đã hủy"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {order?.status === "PENDING" && (
                                      <button
                                        className="p-1.5 bg-blue-700/30 rounded-md text-blue-300 hover:text-white hover:bg-blue-600 transition-colors"
                                        onClick={() =>
                                          handleUpdateOrderStatus(
                                            order.id,
                                            "PROCESSING"
                                          )
                                        }
                                        title="Xử lý đơn hàng"
                                      >
                                        <Clock className="w-4 h-4" />
                                      </button>
                                    )}

                                    {order?.status === "PROCESSING" && (
                                      <button
                                        className="p-1.5 bg-green-700/30 rounded-md text-green-300 hover:text-white hover:bg-green-600 transition-colors"
                                        onClick={() =>
                                          handleUpdateOrderStatus(
                                            order.id,
                                            "DELIVERED"
                                          )
                                        }
                                        title="Hoàn thành đơn hàng"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                    )}

                                    {(order?.status === "PENDING" ||
                                      order?.status === "PROCESSING") && (
                                      <button
                                        className="p-1.5 bg-red-700/30 rounded-md text-red-300 hover:text-white hover:bg-red-600 transition-colors"
                                        onClick={() =>
                                          handleCancelOrder(order.id)
                                        }
                                        title="Hủy đơn hàng"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-6 text-center text-gray-400"
                              >
                                Không có đơn hàng nào
                              </td>
                            </tr>
                          )}
                        </motion.tbody>
                      </table>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden"
                  variants={fadeInUp}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Danh Sách Sản Phẩm
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Quản lý tất cả sản phẩm thời trang trong hệ thống
                        </p>
                      </div>
                      <motion.button
                        className="mt-4 md:mt-0 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center justify-center"
                        variants={fadeInUp}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Thêm Sản Phẩm
                      </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                      <button
                        className="flex items-center text-gray-400 hover:text-white mb-4"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                        {showFilters ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </button>

                      <AnimatePresence>
                        {showFilters && (
                          <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="relative">
                              <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              />
                              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>

                            <div className="relative">
                              <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="PENDING">Đang chờ duyệt</option>
                                <option value="INACTIVE">
                                  Không hoạt động
                                </option>
                              </select>
                              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            <button
                              onClick={handleSearch}
                              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                            >
                              Áp dụng bộ lọc
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Products Table */}
                    <motion.div className="overflow-x-auto" variants={fadeInUp}>
                      <table className="w-full text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">ID</th>
                            <th className="px-4 py-3">Sản phẩm</th>
                            <th className="px-4 py-3">Giá</th>
                            <th className="px-4 py-3">Tồn kho</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3 rounded-tr-lg">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <motion.tbody
                          className="divide-y divide-gray-700"
                          variants={staggerContainer}
                        >
                          {products.map((product, index) => (
                            <motion.tr
                              key={product?.id || index}
                              className="bg-gray-800 hover:bg-gray-750"
                              variants={fadeInUp}
                              custom={index}
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                {product?.id || index + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-md bg-gray-700 overflow-hidden mr-3">
                                    <img
                                      src={
                                        product?.imageUrl
                                          ? `http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`
                                          : "/placeholder.jpg"
                                      }
                                      alt={product?.name || "Product"}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/100x100/333/FFF?text=Fashion";
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {product?.name || "Sản phẩm thời trang"}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {product?.categoryName || "Thời trang"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-pink-400 font-medium">
                                {formatCurrency(product?.price || 0)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                                {product?.stockQuantity || 0} đơn vị
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    product?.status === "ACTIVE"
                                      ? "bg-green-900/50 text-green-400 border border-green-500/30"
                                      : product?.status === "PENDING"
                                      ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                                      : "bg-red-900/50 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {product?.status === "ACTIVE"
                                    ? "Hoạt động"
                                    : product?.status === "PENDING"
                                    ? "Chờ duyệt"
                                    : "Không hoạt động"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </table>
                    </motion.div>

                    {/* Pagination */}
                    <motion.div
                      className="flex flex-col md:flex-row justify-between items-center mt-6"
                      variants={fadeInUp}
                    >
                      <div className="text-sm text-gray-400 mb-4 md:mb-0">
                        Hiển thị {products.length} trên {totalItems} sản phẩm
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          className={`px-3 py-1 rounded-md ${
                            page === 0
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
                          const pageNum = i + Math.max(0, page - 2);
                          if (pageNum < totalPages) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`w-8 h-8 rounded-md ${
                                  pageNum === page
                                    ? "bg-pink-600 text-white"
                                    : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          }
                          return null;
                        })}

                        <button
                          onClick={() =>
                            setPage(Math.min(totalPages - 1, page + 1))
                          }
                          disabled={page >= totalPages - 1}
                          className={`px-3 py-1 rounded-md ${
                            page >= totalPages - 1
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Đánh Giá Gần Đây
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Quản lý đánh giá sản phẩm từ người dùng
                        </p>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {Array.isArray(reviews) ? (
                        reviews.slice(0, 5).map((review, index) => (
                          <div
                            key={review?.id || index}
                            className="bg-gray-750 border border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                  <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {review?.userName || "Người dùng ẩn danh"}
                                  </div>
                                  <div className="flex items-center mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < (review?.rating || 0)
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-600"
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-400">
                                      {new Date(
                                        review?.createdAt || new Date()
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  review?.verified
                                    ? "bg-green-900/50 text-green-400 border border-green-500/30"
                                    : "bg-gray-700 text-gray-400 border border-gray-600"
                                }`}
                              >
                                {review?.verified
                                  ? "Đã xác minh"
                                  : "Chưa xác minh"}
                              </span>
                            </div>
                            <p className="text-gray-300 mt-2 ml-13">
                              {review?.comment ||
                                "Sản phẩm thời trang rất đẹp và chất lượng cao."}
                            </p>
                            <div className="flex justify-end gap-2 mt-3">
                              <button className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 hover:text-white text-sm transition-colors">
                                Xác minh
                              </button>
                              <button className="px-3 py-1.5 bg-gray-700 text-red-400 rounded-md hover:bg-red-900/50 text-sm transition-colors">
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-4">
                          Không có đánh giá nào
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Danh Sách Người Dùng
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Quản lý tất cả người dùng trong hệ thống
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 relative">
                        <input
                          type="text"
                          placeholder="Tìm kiếm người dùng..."
                          className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">ID</th>
                            <th className="px-4 py-3">Người dùng</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Vai trò</th>
                            <th className="px-4 py-3 rounded-tr-lg">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {users.slice(0, 5).map((user, index) => (
                            <tr
                              key={user?.id || index}
                              className="bg-gray-800 hover:bg-gray-750"
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                {user?.id || index + 1}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {user?.firstname} {user?.lastname}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Tham gia:{" "}
                                      {new Date().toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                                {user?.email || "user@example.com"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                                {user?.role || "Người dùng"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 bg-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Revenue Tab */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          Báo Cáo Doanh Thu
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Phân tích chi tiết doanh thu của website
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <button className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Xuất báo cáo
                        </button>
                      </div>
                    </div>

                    {/* Revenue Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">
                          Tổng doanh thu
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(orderRevenue || totalRevenue)}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-500">20.1%</span>
                          <span className="text-gray-400 ml-1">
                            so với tháng trước
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">
                          Doanh thu trung bình mỗi đơn
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(
                            totalOrders > 0 ? orderRevenue / totalOrders : 0
                          )}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-500">5.3%</span>
                          <span className="text-gray-400 ml-1">
                            so với tháng trước
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">
                          Tỷ lệ hoàn thành đơn hàng
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {totalOrders > 0
                            ? Math.round((completedOrders / totalOrders) * 100)
                            : 0}
                          %
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-500">2.5%</span>
                          <span className="text-gray-400 ml-1">
                            so với tháng trước
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="h-[300px] w-full mb-6">
                      <canvas ref={revenueChartRef}></canvas>
                    </div>

                    {/* Revenue Table */}
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Lịch sử doanh thu
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Mã ĐH</th>
                            <th className="px-4 py-3">Ngày</th>
                            <th className="px-4 py-3">Khách hàng</th>
                            <th className="px-4 py-3">Số lượng SP</th>
                            <th className="px-4 py-3">Trạng thái</th>
                            <th className="px-4 py-3 rounded-tr-lg">
                              Doanh thu
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {Array.isArray(orders) && orders.length > 0 ? (
                            orders.map((order, index) => (
                              <tr
                                key={order?.id || index}
                                className="bg-gray-800 hover:bg-gray-750"
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  #{order?.id || index + 1}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {formatDate(order?.orderDate)}
                                </td>
                                <td className="px-4 py-3">
                                  {order?.customerName || "Khách hàng"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {order?.orderItems?.length || 0} sản phẩm
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      order?.status === "DELIVERED"
                                        ? "bg-green-900/50 text-green-400 border border-green-500/30"
                                        : order?.status === "PROCESSING"
                                        ? "bg-blue-900/50 text-blue-400 border border-blue-500/30"
                                        : order?.status === "PENDING"
                                        ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                                        : "bg-red-900/50 text-red-400 border border-red-500/30"
                                    }`}
                                  >
                                    {order?.status === "DELIVERED"
                                      ? "Hoàn thành"
                                      : order?.status === "PROCESSING"
                                      ? "Đang xử lý"
                                      : order?.status === "PENDING"
                                      ? "Chờ xử lý"
                                      : "Đã hủy"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-pink-400 font-medium">
                                  {formatCurrency(order?.totalAmount || 0)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-6 text-center text-gray-400"
                              >
                                Không có dữ liệu doanh thu
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
