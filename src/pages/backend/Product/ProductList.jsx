"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  User,
  FileDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductService from "../../../api/ProductService";
import UserService from "../../../api/UserService";
import CategoryService from "../../../api/CategoryService";
import * as XLSX from "xlsx";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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

export default function UserProductManagement() {
  const [users, setUsers] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Categories
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);

  // Filter states for products
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Sorting states
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortOption, setSortOption] = useState("default");

  // Animation state
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Refs for scroll animations
  const tableRef = useRef(null);
  const filtersRef = useRef(null);

  // Set page as loaded after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await UserService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
        console.error("❌ Lỗi khi tải người dùng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await CategoryService.getActiveCategories();
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : [];
        setCategories(fetchedCategories);
      } catch (err) {
        setError("Không thể tải danh mục");
        console.error("Lỗi khi tải danh mục:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Fetch products for selected user
  const fetchUserProducts = async () => {
    try {
      setLoadingProducts(true);

      // Only pass parameters that have values
      const keywordParam = keyword || undefined;
      const statusParam = status ? status : undefined;
      const categoryIdParam = categoryId || undefined;
      const minPriceParam = minPrice || undefined;
      const maxPriceParam = maxPrice || undefined;
      const minStockParam = minStock || undefined;
      const maxStockParam = maxStock || undefined;

      // Only pass sellerId if not showing all products
      const sellerIdParam =
        !showAllProducts && selectedUser ? selectedUser.id : undefined;

      const data = await ProductService.getAllProducts(
        keywordParam,
        statusParam,
        categoryIdParam,
        sellerIdParam, // sellerId (undefined when showing all)
        minPriceParam,
        maxPriceParam,
        minStockParam,
        maxStockParam,
        page,
        size,
        sortField,
        sortDirection
      );

      setProducts(data.content || data);
      setTotalItems(data.totalElements || data.length);
      setError(null);
    } catch (err) {
      setError(
        "Không thể tải sản phẩm: " + (err.message || "Lỗi không xác định")
      );
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // When user is selected or filters change
  useEffect(() => {
    if (selectedUser || showAllProducts) {
      fetchUserProducts();
    } else {
      setProducts([]);
    }
  }, [selectedUser, page, size, sortField, sortDirection, showAllProducts]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowAllProducts(false);
    setPage(0); // Reset to first page when changing user
  };

  const handleSortChange = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
    fetchUserProducts();
  };

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setMaxStock("");
    setSortOption("default");
    setSortField("id");
    setSortDirection("asc");
    setPage(0);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  const handleSortOptionChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    // Map the sort option to sortField and sortDirection
    switch (option) {
      case "newest":
        setSortField("createdAt");
        setSortDirection("desc");
        break;
      case "oldest":
        setSortField("createdAt");
        setSortDirection("asc");
        break;
      case "price-asc":
        setSortField("price");
        setSortDirection("asc");
        break;
      case "price-desc":
        setSortField("price");
        setSortDirection("desc");
        break;
      case "name-asc":
        setSortField("name");
        setSortDirection("asc");
        break;
      case "name-desc":
        setSortField("name");
        setSortDirection("desc");
        break;
      case "stock-asc":
        setSortField("stockQuantity");
        setSortDirection("asc");
        break;
      case "stock-desc":
        setSortField("stockQuantity");
        setSortDirection("desc");
        break;
      default:
        setSortField("id");
        setSortDirection("asc");
    }

    setPage(0); // Reset to first page when sorting changes
  };

  // Function to export products to Excel
  const exportToExcel = async () => {
    try {
      // Show loading state
      setLoadingProducts(true);

      // Fetch all products for export (without pagination)
      const keywordParam = keyword || undefined;
      const statusParam = status ? status : undefined;
      const categoryIdParam = categoryId || undefined;
      const minPriceParam = minPrice || undefined;
      const maxPriceParam = maxPrice || undefined;
      const minStockParam = minStock || undefined;
      const maxStockParam = maxStock || undefined;
      const sellerIdParam =
        !showAllProducts && selectedUser ? selectedUser.id : undefined;

      // Call API with size=1000 to get more products for export
      const data = await ProductService.getAllProducts(
        keywordParam,
        statusParam,
        categoryIdParam,
        sellerIdParam,
        minPriceParam,
        maxPriceParam,
        minStockParam,
        maxStockParam,
        0, // page
        1000, // size (larger to get more products)
        sortField,
        sortDirection
      );

      const productsToExport = data.content || data;

      // Map status values to readable text
      const mappedProducts = productsToExport.map((product) => ({
        ID: product.id,
        "Tên Sản Phẩm": product.name,
        "Danh Mục": product.categoryName,
        "Giá (VND)": product.price,
        "Tồn Kho": product.stockQuantity,
        "Trạng Thái":
          product.status === "ACTIVE"
            ? "Đang hoạt động"
            : product.status === "PENDING"
            ? "Đang chờ duyệt"
            : "Không hoạt động",
        "Người Bán":
          product.sellerName ||
          (product.seller
            ? `${product.seller.firstname} ${product.seller.lastname}`
            : "N/A"),
        "Ngày Tạo": product.createdAt
          ? new Date(product.createdAt).toLocaleString("vi-VN")
          : "N/A",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(mappedProducts);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sản Phẩm");

      // Generate Excel file
      const fileName = showAllProducts
        ? "Danh_Sach_Tat_Ca_San_Pham.xlsx"
        : `Danh_Sach_San_Pham_${selectedUser?.firstname}_${selectedUser?.lastname}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      setError("Không thể xuất file Excel. Vui lòng thử lại sau.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / size);

    return (
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="text-sm text-gray-400">
          Hiển thị {products.length} trên {totalItems} sản phẩm
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={`px-3 py-1 rounded-md transition-colors ${
              page === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Trước
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
              const pageNum = i + Math.max(0, page - 2);
              if (pageNum < totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-md transition-colors ${
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
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className={`px-3 py-1 rounded-md transition-colors ${
              page >= totalPages - 1
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
          >
            Sau
          </button>

          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="ml-2 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
          >
            <option value="5">5 mỗi trang</option>
            <option value="10">10 mỗi trang</option>
            <option value="20">20 mỗi trang</option>
            <option value="50">50 mỗi trang</option>
          </select>
        </div>
      </motion.div>
    );
  };

  if (loading && !users.length)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
        variants={fadeInUp}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-0">
          Quản Lý Sản Phẩm Người Dùng
        </h1>
        <div className="flex flex-wrap gap-3">
          {(selectedUser || showAllProducts) && products.length > 0 && (
            <motion.button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              disabled={loadingProducts}
            >
              <FileDown size={18} />
              {loadingProducts ? "Đang xuất..." : "Xuất Excel"}
            </motion.button>
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              <Plus size={18} />
              Thêm Sản Phẩm Mới
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* User List Sidebar */}
        <motion.div
          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          initial="hidden"
          animate={isPageLoaded ? "visible" : "hidden"}
          variants={fadeInLeft}
        >
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Người Dùng
            </h2>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm người dùng..."
                className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <motion.div
            className="overflow-y-auto max-h-[calc(100vh-250px)]"
            variants={staggerContainer}
          >
            <ul className="divide-y divide-gray-700">
              <motion.li
                variants={fadeInUp}
                onClick={() => {
                  setSelectedUser(null);
                  setShowAllProducts(true);
                  setPage(0);
                }}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-700 ${
                  showAllProducts
                    ? "bg-gray-700 border-l-4 border-pink-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-pink-600 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      Hiển thị tất cả
                    </div>
                    <div className="text-sm text-gray-400">Tất cả sản phẩm</div>
                  </div>
                </div>
              </motion.li>

              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  Không tìm thấy người dùng
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.li
                    key={user.id}
                    variants={fadeInUp}
                    custom={index}
                    onClick={() => handleUserClick(user)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-700 ${
                      selectedUser?.id === user.id
                        ? "bg-gray-700 border-l-4 border-pink-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-300" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {user.firstname} {user.lastname}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>

        {/* Product List */}
        <motion.div
          className="md:col-span-3"
          initial="hidden"
          animate={isPageLoaded ? "visible" : "hidden"}
          variants={fadeInRight}
        >
          <div className="bg-gray-800 rounded-xl shadow-lg mb-6 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <motion.h2
                className="text-xl font-semibold text-white mb-4"
                variants={fadeInUp}
              >
                {showAllProducts
                  ? "Tất Cả Sản Phẩm"
                  : selectedUser
                  ? `Sản Phẩm Của ${selectedUser.firstname} ${selectedUser.lastname}`
                  : "Chọn người dùng để xem sản phẩm"}
              </motion.h2>

              {(selectedUser || showAllProducts) && (
                <>
                  <motion.form
                    onSubmit={handleSearch}
                    className="flex flex-col md:flex-row gap-4 mb-4"
                    ref={filtersRef}
                    variants={fadeInUp}
                  >
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <Search
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                      />
                    </div>

                    <select
                      value={status}
                      onChange={handleStatusChange}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Tất Cả Sản Phẩm</option>
                      <option value="ACTIVE">Sản Phẩm Đang Hoạt Động</option>
                      <option value="PENDING">Sản Phẩm Đang Chờ Duyệt</option>
                      <option value="INACTIVE">Sản Phẩm Không Hoạt Động</option>
                    </select>

                    <select
                      value={sortOption}
                      onChange={handleSortOptionChange}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="default">Sắp xếp mặc định</option>
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="price-asc">Giá: Thấp đến cao</option>
                      <option value="price-desc">Giá: Cao đến thấp</option>
                      <option value="name-asc">Tên: A-Z</option>
                      <option value="name-desc">Tên: Z-A</option>
                      <option value="stock-asc">Tồn kho: Thấp đến cao</option>
                      <option value="stock-desc">Tồn kho: Cao đến thấp</option>
                    </select>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
                    >
                      Tìm Kiếm
                    </button>
                  </motion.form>

                  <motion.div
                    className="flex justify-between items-center"
                    variants={fadeInUp}
                  >
                    <button
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className="text-pink-400 hover:text-pink-300 text-sm font-medium flex items-center transition-colors"
                    >
                      <Filter size={16} className="mr-1" />
                      {showAdvancedFilters ? "Ẩn" : "Hiện"} Bộ Lọc Nâng Cao
                      {showAdvancedFilters ? (
                        <ChevronUp size={16} className="ml-1" />
                      ) : (
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </button>

                    {(keyword ||
                      status ||
                      categoryId ||
                      minPrice ||
                      maxPrice ||
                      minStock ||
                      maxStock) && (
                      <button
                        onClick={clearFilters}
                        className="text-gray-400 hover:text-gray-300 text-sm font-medium flex items-center transition-colors"
                      >
                        <X size={16} className="mr-1" />
                        Xóa Tất Cả Bộ Lọc
                      </button>
                    )}
                  </motion.div>

                  {showAdvancedFilters && (
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <label
                          htmlFor="categoryId"
                          className="block text-sm font-medium text-gray-300 mb-1"
                        >
                          Danh Mục
                        </label>
                        <select
                          id="categoryId"
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        >
                          <option value="">Tất Cả Danh Mục</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Khoảng Giá
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Tối thiểu"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Tối đa"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Số Lượng Tồn Kho
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={minStock}
                            onChange={(e) => setMinStock(e.target.value)}
                            placeholder="Tối thiểu"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="number"
                            value={maxStock}
                            onChange={(e) => setMaxStock(e.target.value)}
                            placeholder="Tối đa"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {loadingProducts && (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            )}

            {!selectedUser && !showAllProducts && !loadingProducts && (
              <motion.div
                className="bg-gray-800 p-8 rounded-lg text-center"
                variants={fadeInUp}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
                  <User size={32} />
                </div>
                <p className="text-lg text-gray-300 font-medium">
                  Chưa chọn người dùng
                </p>
                <p className="text-gray-400 mt-2">
                  Chọn một người dùng từ danh sách để xem sản phẩm hoặc chọn
                  "Hiển thị tất cả"
                </p>
              </motion.div>
            )}

            {(selectedUser || showAllProducts) &&
              !loadingProducts &&
              products.length === 0 && (
                <motion.div
                  className="bg-gray-800 p-8 rounded-lg text-center"
                  variants={fadeInUp}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-lg text-gray-300 font-medium">
                    Không tìm thấy sản phẩm
                  </p>
                  <p className="text-gray-400 mt-2">
                    {showAllProducts
                      ? "Không có sản phẩm nào phù hợp với bộ lọc"
                      : "Người dùng này không có sản phẩm nào hoặc không có sản phẩm phù hợp với bộ lọc"}
                  </p>
                </motion.div>
              )}

            {(selectedUser || showAllProducts) &&
              !loadingProducts &&
              products.length > 0 && (
                <motion.div
                  className="overflow-x-auto"
                  ref={tableRef}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                >
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("name")}
                        >
                          <div className="flex items-center">
                            Sản Phẩm
                            {sortField === "name" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("price")}
                        >
                          <div className="flex items-center">
                            Giá
                            {sortField === "price" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("stockQuantity")}
                        >
                          <div className="flex items-center">
                            Tồn Kho
                            {sortField === "stockQuantity" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSortChange("status")}
                        >
                          <div className="flex items-center">
                            Trạng Thái
                            {sortField === "status" && (
                              <span className="ml-1">
                                {sortDirection === "asc" ? (
                                  <ArrowUp size={14} />
                                ) : (
                                  <ArrowDown size={14} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Thao Tác
                        </th>
                      </tr>
                    </thead>
                    <motion.tbody
                      className="bg-gray-800 divide-y divide-gray-700"
                      variants={staggerContainer}
                    >
                      {products.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          className="hover:bg-gray-750 transition-colors"
                          variants={fadeInUp}
                          custom={index}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md overflow-hidden">
                                <img
                                  className="h-10 w-10 object-cover"
                                  src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://placehold.co/600x400/EEE/31343C";
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {" "}
                                  <h3
                                    className="text-sm font-medium text-white"
                                    title={product.name}
                                  >
                                    {product.name.length > 50
                                      ? product.name.substring(0, 50) + "..."
                                      : product.name}
                                  </h3>
                                </div>
                                <div className="text-xs text-gray-400">
                                  {product.categoryName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-pink-400 font-medium">
                              {product.price?.toLocaleString()} VND
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {product.stockQuantity} đơn vị
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.status === "ACTIVE"
                                  ? "bg-green-900 text-green-300"
                                  : product.status === "PENDING"
                                  ? "bg-yellow-900 text-yellow-300"
                                  : "bg-red-900 text-red-300"
                              }`}
                            >
                              {product.status === "ACTIVE"
                                ? "Đang hoạt động"
                                : product.status === "PENDING"
                                ? "Đang chờ duyệt"
                                : "Không hoạt động"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/products/${product.id}`}
                                className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                                title="Xem"
                              >
                                <Eye size={16} />
                                <span className="sr-only">Xem</span>
                              </Link>
                              <Link
                                to={`/admin/products/${product.id}/edit`}
                                className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                                title="Sửa"
                              >
                                <Edit size={16} />
                                <span className="sr-only">Sửa</span>
                              </Link>
                              <Link
                                to={`/admin/products/${product.id}/delete`}
                                className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-red-600 rounded-md transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                                <span className="sr-only">Xóa</span>
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </motion.div>
              )}
          </div>

          {(selectedUser || showAllProducts) &&
            products.length > 0 &&
            renderPagination()}
        </motion.div>
      </div>
    </div>
  );
}
