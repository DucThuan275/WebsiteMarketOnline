"use client";

import { useEffect, useState } from "react";
import OrderService from "../../../api/OrderService";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  ShoppingBag,
  Filter,
  Plus,
} from "lucide-react";

const GetMyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userOrders = await OrderService.getCurrentUserOrders();
        setOrders(userOrders);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on status and search term
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filter !== "ALL" && order.status !== filter) {
      return false;
    }

    // Filter by search term (order ID or items)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderIdMatch = order.id.toString().includes(searchLower);
      const itemsMatch =
        order.items &&
        order.items.some(
          (item) =>
            item.productName &&
            item.productName.toLowerCase().includes(searchLower)
        );

      return orderIdMatch || itemsMatch;
    }

    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date_desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "amount_asc":
        return a.totalAmount - b.totalAmount;
      case "amount_desc":
        return b.totalAmount - a.totalAmount;
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-4 h-4 mr-1" />,
      },
      PROCESSING: {
        color: "bg-blue-100 text-blue-800",
        icon: <RefreshCw className="w-4 h-4 mr-1" />,
      },
      SHIPPED: {
        color: "bg-indigo-100 text-indigo-800",
        icon: <Truck className="w-4 h-4 mr-1" />,
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800",
        icon: <Package className="w-4 h-4 mr-1" />,
      },
      RECEIVED: {
        color: "bg-emerald-100 text-emerald-800",
        icon: <CheckCircle className="w-4 h-4 mr-1" />,
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4 mr-1" />,
      },
      RETURNED: {
        color: "bg-orange-100 text-orange-800",
        icon: <RefreshCw className="w-4 h-4 mr-1" />,
      },
    };

    const statusInfo = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      icon: null,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.icon}
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-lg">Đang tải danh sách đơn hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
          <p className="mt-2">Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              to="/trang-chu"
              className="text-gray-700 hover:text-gray-900 inline-flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <Link
                to="/trang-chu/nguoi-dung"
                className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2 text-sm font-medium"
              >
                Người dùng
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span
                className="text-gray-500 ml-1 md:ml-2 text-sm font-medium"
                aria-current="page"
              >
                Đơn hàng của bạn
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Page Header */}
        <div className="container mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white rounded-xl shadow-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <ShoppingBag className="w-6 h-6 mr-2" />
                Đơn hàng của bạn
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="mr-2 h-5 w-5 text-gray-500" />
                Bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái đơn hàng
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "ALL"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilter("PENDING")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Chờ xử lý
                </button>
                <button
                  onClick={() => setFilter("PROCESSING")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "PROCESSING"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Đang xử lý
                </button>
                <button
                  onClick={() => setFilter("SHIPPED")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "SHIPPED"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Đang giao
                </button>
                <button
                  onClick={() => setFilter("DELIVERED")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Đã giao
                </button>
                <button
                  onClick={() => setFilter("RECEIVED")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "RECEIVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Đã nhận
                </button>
                <button
                  onClick={() => setFilter("CANCELLED")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Đã hủy
                </button>
                <button
                  onClick={() => setFilter("RETURNED")}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter === "RETURNED"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  Đã trả hàng
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="date_desc">Mới nhất</option>
                <option value="date_asc">Cũ nhất</option>
                <option value="amount_desc">Giá trị cao nhất</option>
                <option value="amount_asc">Giá trị thấp nhất</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-6">
            {searchTerm || filter !== "ALL"
              ? "Không có đơn hàng nào phù hợp với bộ lọc của bạn."
              : "Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!"}
          </p>
          <Link
            to="/trang-chu/san-pham"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <li key={order.id} className="hover:bg-gray-50">
                <Link
                  to={`/trang-chu/nguoi-dung/don-hang/${order.id}`}
                  className="block"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Đơn hàng #{order.id}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {order.orderDetails && order.orderDetails.length > 0
                            ? `${order.orderDetails.length} sản phẩm`
                            : "Không có thông tin sản phẩm"}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.totalAmount)}
                        </p>
                        <ChevronRight className="flex-shrink-0 ml-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Ngày đặt hàng: {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GetMyOrders;
