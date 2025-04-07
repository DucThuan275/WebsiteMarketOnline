"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
  Home,
  ShoppingBag,
  Check,
  LayoutGrid,
  List,
  Star,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import CategoryService from "../../../api/CategoryService";
import ProductService from "../../../api/ProductService";
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

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const fadeInRight = {
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

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  // Category state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [status, setStatus] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");

  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  // Sorting states
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // Mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [sellerSearchTerm, setSellerSearchTerm] = useState("");

  // View mode (grid or list)
  const [viewMode, setViewMode] = useState("grid");

  // Price range slider
  const [priceRange, setPriceRange] = useState([0, 10000000]); // Default range in VND
  const [maxPriceLimit, setMaxPriceLimit] = useState(10000000); // Default max price limit
  const minPriceRef = useRef(null);
  const maxPriceRef = useRef(null);

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
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // Define sort fields based on sortBy value
  const getSortParams = () => {
    switch (sortBy) {
      case "price-low-high":
        return { field: "price", direction: "asc" };
      case "price-high-low":
        return { field: "price", direction: "desc" };
      case "popularity":
        return { field: "stockQuantity", direction: "asc" };
      case "non-popularity":
        return { field: "stockQuantity", direction: "desc" };
      case "name-a-z":
        return { field: "name", direction: "asc" };
      case "name-z-a":
        return { field: "name", direction: "desc" };
      case "oldest":
        return { field: "createdAt", direction: "asc" };
      case "newest":
      default:
        return { field: "createdAt", direction: "desc" };
    }
  };

  // Fetch Sellers
  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoadingSellers(true);
      const data = await UserService.getAllUsers();
      setSellers(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
      console.error("❌ Lỗi khi tải danh sách người dùng:", err);
    } finally {
      setLoadingSellers(false);
    }
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [
    categoryId,
    page,
    size,
    sortBy,
    sellerId,
    minPrice,
    maxPrice,
    keyword,
    status,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { field: sortField, direction: sortDirection } = getSortParams();
      let data;

      if (status === "my-active-products") {
        data = await ProductService.getMyActiveProducts();
      } else {
        // Only pass parameters that have values, not nulls or empty strings
        const keywordParam = keyword || undefined;
        const statusParam =
          status !== "my-active-products" && status ? status : undefined;
        const categoryIdParam = categoryId || undefined;
        const sellerIdParam = sellerId || undefined;
        const minPriceParam = minPrice || undefined;
        const maxPriceParam = maxPrice || undefined;
        const minStockParam = minStock || undefined;
        const maxStockParam = maxStock || undefined;

        data = await ProductService.getActiveProducts(
          keywordParam,
          statusParam,
          categoryIdParam,
          sellerIdParam,
          minPriceParam,
          maxPriceParam,
          minStockParam,
          maxStockParam,
          page,
          size,
          sortField,
          sortDirection
        );
      }

      setProducts(data.content || data);
      setTotalItems(data.totalElements || data.length);
      setError(null);

      // Find the highest price for the price range slider
      if (data.content && data.content.length > 0) {
        const highestPrice = Math.max(
          ...data.content.map((product) => product.price || 0)
        );
        setMaxPriceLimit(Math.max(highestPrice * 1.2, 10000000)); // Set max price limit to 120% of highest price or default

        // Only update price range if it hasn't been set by user
        if (minPrice === "" && maxPrice === "") {
          setPriceRange([0, highestPrice * 1.2]);
        }
      }
    } catch (err) {
      setError("Failed to load products: " + (err.message || "Unknown error"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
    fetchProducts();
  };

  const clearFilters = () => {
    setKeyword("");
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setSellerId(""); // Clear seller filter
    setStatus("");
    setPage(0);
    setPriceRange([0, maxPriceLimit]);

    // Reset the range input values
    if (minPriceRef.current) minPriceRef.current.value = 0;
    if (maxPriceRef.current) maxPriceRef.current.value = maxPriceLimit;
  };

  // Filter sellers based on search term
  const filteredSellers = sellers.filter((seller) =>
    `${seller.firstname} ${seller.lastname}`
      .toLowerCase()
      .includes(sellerSearchTerm.toLowerCase())
  );

  const handleSellerSelect = (id) => {
    setSellerId(id);
    setShowSellerDropdown(false);
  };

  const getSelectedSellerName = () => {
    if (!sellerId) return "Tất cả người bán";
    const seller = sellers.find((s) => s.id.toString() === sellerId);
    return seller
      ? `${seller.firstname} ${seller.lastname}`
      : "Tất cả người bán";
  };

  // Handle price range change
  const handlePriceRangeChange = (e, type) => {
    const value = Number.parseInt(e.target.value, 10);

    if (type === "min") {
      setPriceRange([value, priceRange[1]]);
      setMinPrice(value.toString());
    } else {
      setPriceRange([priceRange[0], value]);
      setMaxPrice(value.toString());
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section with tech-themed background */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            Bộ Sưu Tập Sản Phẩm Công Nghệ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-indigo-100 text-center max-w-2xl mx-auto"
          >
            Khám phá những sản phẩm sản phẩm kết hợp công nghệ tiên tiến, thiết
            kế hiện đại và chất liệu cao cấp
          </motion.p>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="container mx-auto px-4 py-8"
      >
        {/* Skeleton loader for breadcrumb when loading */}
        {loading && (
          <div className="flex mb-6 animate-pulse">
            <div className="inline-flex items-center space-x-1 md:space-x-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="w-5 h-5 text-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="w-5 h-5 text-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <motion.nav
          variants={fadeInDown}
          className="mb-6"
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <Link
                  to="/trang-chu/san-pham"
                  className="text-gray-600 hover:text-indigo-600 ml-1 md:ml-2 text-sm font-medium transition-colors"
                >
                  Sản phẩm
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span
                  className="text-indigo-600 ml-1 md:ml-2 text-sm font-medium"
                  aria-current="page"
                >
                  Tất cả sản phẩm
                </span>
              </div>
            </li>
          </ol>
        </motion.nav>

        <motion.div
          variants={fadeInUp}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Tất Cả Sản Phẩm
          </h1>

          {/* Mobile filter toggle */}
          <motion.button
            variants={fadeInLeft}
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Lọc</span>
          </motion.button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters section - hidden on mobile unless toggled */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 768) && (
              <motion.div
                initial={
                  window.innerWidth < 768 ? { opacity: 0, x: -20 } : false
                }
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-72 lg:w-80"
              >
                <motion.div
                  variants={fadeInLeft}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4"
                >
                  {/* Mobile filter header */}
                  <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-lg">Lọc sản phẩm</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <motion.div variants={staggerContainer} className="p-5">
                    {/* Search */}
                    <motion.div variants={fadeInUp} className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Tìm kiếm
                      </h3>
                      <form onSubmit={handleSearch} className="flex">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          placeholder="Tên sản phẩm..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Search className="h-5 w-5" />
                        </button>
                      </form>
                    </motion.div>

                    {/* My Products Filter */}
                    <motion.div variants={fadeInUp} className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Sản phẩm của bạn
                      </h3>
                      <select
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent appearance-none bg-white"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="">Tất cả sản phẩm</option>
                        <option value="my-active-products">
                          Sản phẩm của bạn
                        </option>
                      </select>
                    </motion.div>

                    {/* Categories */}
                    <motion.div variants={fadeInUp} className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Danh mục
                      </h3>
                      <motion.div
                        variants={staggerContainer}
                        className="max-h-48 overflow-y-auto pr-2 space-y-2"
                      >
                        <motion.div
                          variants={fadeInUp}
                          className="flex items-center"
                        >
                          <input
                            id="category-all"
                            type="radio"
                            name="category"
                            checked={categoryId === ""}
                            onChange={() => setCategoryId("")}
                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor="category-all"
                            className="ml-2 text-gray-700 text-sm"
                          >
                            Tất cả danh mục
                          </label>
                        </motion.div>
                        {loadingCategories ? (
                          <div className="text-gray-500 text-sm py-2">
                            Đang tải danh mục...
                          </div>
                        ) : (
                          categories.map((category, index) => (
                            <motion.div
                              key={category.id}
                              variants={fadeInUp}
                              custom={index}
                              className="flex items-center"
                            >
                              <input
                                id={`category-${category.id}`}
                                type="radio"
                                name="category"
                                checked={categoryId === category.id.toString()}
                                onChange={() =>
                                  setCategoryId(category.id.toString())
                                }
                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor={`category-${category.id}`}
                                className="ml-2 text-gray-700 text-sm"
                              >
                                {category.name}
                              </label>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Sellers - Improved dropdown */}
                    <motion.div variants={fadeInUp} className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Người bán
                      </h3>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-left text-sm"
                          onClick={() =>
                            setShowSellerDropdown(!showSellerDropdown)
                          }
                        >
                          <span className="truncate">
                            {getSelectedSellerName()}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              showSellerDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {showSellerDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden"
                            >
                              <div className="p-2 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    value={sellerSearchTerm}
                                    onChange={(e) =>
                                      setSellerSearchTerm(e.target.value)
                                    }
                                    placeholder="Tìm người bán..."
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm"
                                  />
                                </div>
                              </div>
                              <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="overflow-y-auto max-h-40"
                              >
                                <motion.div
                                  variants={fadeInUp}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                  onClick={() => handleSellerSelect("")}
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                  }}
                                >
                                  <div className="w-4 mr-2">
                                    {sellerId === "" && (
                                      <Check className="w-4 h-4 text-indigo-600" />
                                    )}
                                  </div>
                                  <span className="text-sm">
                                    Tất cả người bán
                                  </span>
                                </motion.div>

                                {loadingSellers ? (
                                  <div className="px-3 py-2 text-gray-500 text-sm">
                                    Đang tải...
                                  </div>
                                ) : filteredSellers.length === 0 ? (
                                  <div className="px-3 py-2 text-gray-500 text-sm">
                                    Không tìm thấy người bán
                                  </div>
                                ) : (
                                  filteredSellers.map((seller, index) => (
                                    <motion.div
                                      key={seller.id}
                                      variants={fadeInUp}
                                      custom={index}
                                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                      onClick={() =>
                                        handleSellerSelect(seller.id.toString())
                                      }
                                      whileHover={{
                                        backgroundColor: "rgba(0,0,0,0.05)",
                                      }}
                                    >
                                      <div className="w-4 mr-2">
                                        {sellerId === seller.id.toString() && (
                                          <Check className="w-4 h-4 text-indigo-600" />
                                        )}
                                      </div>
                                      <span className="text-sm truncate">
                                        {seller.firstname} {seller.lastname}
                                      </span>
                                    </motion.div>
                                  ))
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {/* Price Range Slider */}
                    <motion.div variants={fadeInUp} className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Giá (VND)
                      </h3>
                      <div className="space-y-4">
                        {/* Price display */}
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>

                        {/* Min price slider */}
                        <div className="relative">
                          <input
                            ref={minPriceRef}
                            type="range"
                            min="0"
                            max={maxPriceLimit}
                            value={priceRange[0]}
                            onChange={(e) => handlePriceRangeChange(e, "min")}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div
                            className="absolute top-0 right-0 bottom-0 bg-indigo-200 rounded-lg pointer-events-none"
                            style={{
                              width: `${
                                100 - (priceRange[0] / maxPriceLimit) * 100
                              }%`,
                              opacity: 0.5,
                            }}
                          ></div>
                        </div>

                        {/* Max price slider */}
                        <div className="relative">
                          <input
                            ref={maxPriceRef}
                            type="range"
                            min="0"
                            max={maxPriceLimit}
                            value={priceRange[1]}
                            onChange={(e) => handlePriceRangeChange(e, "max")}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div
                            className="absolute top-0 left-0 bottom-0 bg-indigo-200 rounded-lg pointer-events-none"
                            style={{
                              width: `${
                                (priceRange[1] / maxPriceLimit) * 100
                              }%`,
                              opacity: 0.5,
                            }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sort By (Mobile Only) */}
                    <motion.div variants={fadeInUp} className="mb-6 md:hidden">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Sắp xếp theo
                      </h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent appearance-none bg-white"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="price-low-high">
                          Giá: Thấp đến cao
                        </option>
                        <option value="price-high-low">
                          Giá: Cao đến thấp
                        </option>
                        <option value="name-a-z">Tên: A-Z</option>
                        <option value="name-z-a">Tên: Z-A</option>
                        <option value="popularity">Phổ biến nhất</option>
                        <option value="non-popularity">Ít phổ biến nhất</option>
                      </select>
                    </motion.div>

                    {/* Clear Filters Button */}
                    <motion.button
                      variants={fadeInUp}
                      onClick={clearFilters}
                      className="w-full px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X className="w-4 h-4" />
                      <span>Xóa bộ lọc</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <motion.div variants={fadeInRight} className="flex-1">
            {/* Sorting and View Options for desktop */}
            <AnimateWhenVisible
              variants={fadeInUp}
              className="hidden md:flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-medium text-indigo-600">
                  {products.length}
                </span>{" "}
                trên <span className="font-medium">{totalItems}</span> sản phẩm
              </div>

              <div className="flex items-center gap-4">
                {/* View mode toggle */}
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <motion.button
                    whileHover={{
                      backgroundColor:
                        viewMode !== "grid" ? "rgba(0,0,0,0.05)" : undefined,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{
                      backgroundColor:
                        viewMode !== "list" ? "rgba(0,0,0,0.05)" : undefined,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center">
                  <span className="mr-2 text-gray-600 text-sm">
                    Sắp xếp theo:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm appearance-none bg-white"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="price-low-high">Giá: Thấp đến cao</option>
                    <option value="price-high-low">Giá: Cao đến thấp</option>
                    <option value="name-a-z">Tên: A-Z</option>
                    <option value="name-z-a">Tên: Z-A</option>
                    <option value="popularity">Phổ biến nhất</option>
                    <option value="non-popularity">Ít phổ biến nhất</option>
                  </select>
                </div>
              </div>
            </AnimateWhenVisible>

            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Đang tải sản phẩm...</p>
              </motion.div>
            )}

            {/* Error State */}
            {!loading && error && (
              <AnimateWhenVisible
                variants={fadeInUp}
                className="bg-red-50 p-6 rounded-xl border border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-2">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchProducts}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Thử lại
                </motion.button>
              </AnimateWhenVisible>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <AnimateWhenVisible
                variants={fadeInUp}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4"
                >
                  <ShoppingBag className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm nào
                </h3>
                <p className="text-gray-500 mb-6">
                  Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Xóa bộ lọc
                </motion.button>
              </AnimateWhenVisible>
            )}

            {/* Products Grid or List View */}
            {!loading && !error && products.length > 0 && (
              <>
                {viewMode === "grid" ? (
                  <AnimateWhenVisible
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id || index}
                        variants={fadeInUp}
                        custom={index}
                        className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {product ? (
                          <div className="product-card-wrapper">
                            <ProductCard product={product} />
                          </div>
                        ) : (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-red-600">
                              Lỗi hiển thị sản phẩm
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimateWhenVisible>
                ) : (
                  <AnimateWhenVisible
                    variants={staggerContainer}
                    className="space-y-4"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id || index}
                        variants={fadeInUp}
                        custom={index}
                        className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                        whileHover={{
                          y: -3,
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 relative">
                            <img
                              src={
                                product.imageUrl ||
                                "https://placehold.co/300x300/indigo/white?text=Fashion+Tech"
                              }
                              alt={product.name}
                              className="w-full h-48 md:h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/300x300/indigo/white?text=Fashion+Tech";
                                e.target.onerror = null;
                              }}
                            />
                            {product.discount > 0 && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{product.discount}%
                              </div>
                            )}
                            {product.isNew && (
                              <div className="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded">
                                NEW
                              </div>
                            )}
                          </div>
                          <div className="p-4 md:p-6 flex-1 flex flex-col">
                            <div className="mb-2">
                              {product.category && (
                                <span className="text-xs text-indigo-600 font-medium">
                                  {product.category}
                                </span>
                              )}
                              <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                              </h3>
                            </div>

                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {product.description ||
                                "Sản phẩm Sản Phẩm công nghệ cao cấp, thiết kế hiện đại và tinh tế."}
                            </p>

                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (product.rating || 4)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">
                                ({product.reviewCount || 0})
                              </span>
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(product.price)}
                                </span>
                                {product.originalPrice &&
                                  product.originalPrice > product.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(product.originalPrice)}
                                    </span>
                                  )}
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                Thêm vào giỏ
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimateWhenVisible>
                )}

                {/* Pagination */}
                <AnimateWhenVisible
                  variants={fadeInUp}
                  className="flex justify-center mt-10 mb-6"
                >
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={
                        page !== 0
                          ? { scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }
                          : {}
                      }
                      whileTap={page !== 0 ? { scale: 0.9 } : {}}
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        page === 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-indigo-50"
                      }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    {[
                      ...Array(
                        Math.min(5, Math.ceil(totalItems / size))
                      ).keys(),
                    ].map((i) => {
                      const pageNum = i + Math.max(0, page - 2);
                      if (pageNum < Math.ceil(totalItems / size)) {
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPage(pageNum)}
                            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                              pageNum === page
                                ? "bg-indigo-600 text-white"
                                : "text-gray-700 hover:bg-indigo-50"
                            }`}
                          >
                            {pageNum + 1}
                          </motion.button>
                        );
                      }
                      return null;
                    })}

                    <motion.button
                      whileHover={
                        page < Math.ceil(totalItems / size) - 1
                          ? { scale: 1.1, backgroundColor: "rgba(0,0,0,0.05)" }
                          : {}
                      }
                      whileTap={
                        page < Math.ceil(totalItems / size) - 1
                          ? { scale: 0.9 }
                          : {}
                      }
                      onClick={() =>
                        setPage(
                          Math.min(Math.ceil(totalItems / size) - 1, page + 1)
                        )
                      }
                      disabled={page >= Math.ceil(totalItems / size) - 1}
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        page >= Math.ceil(totalItems / size) - 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-indigo-50"
                      }`}
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </AnimateWhenVisible>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Product;
