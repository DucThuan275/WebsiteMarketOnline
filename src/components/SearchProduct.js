"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  Loader2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import ProductService from "../api/ProductService";

const SearchProduct = ({ isOpen, onClose }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
      } catch (e) {
        console.error("Error parsing recent searches:", e);
      }
    }
  }, []);

  // Save a search term to recent searches
  const saveRecentSearch = (term) => {
    const updatedSearches = [
      term,
      ...recentSearches.filter((item) => item !== term),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close results and search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        if (onClose) onClose(); // Close the entire search bar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Search as you type with minimal delay
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (keyword.trim().length >= 1) {
        searchProducts();
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(
          keyword.trim().length === 0 && recentSearches.length > 0
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, isOpen, recentSearches.length]);

  const searchProducts = async () => {
    if (keyword.trim().length < 1) return;

    setLoading(true);
    try {
      const response = await ProductService.searchProductAttachments(
        keyword,
        null,
        null,
        0,
        8,
        "name",
        "asc"
      );

      setResults(response.content || []);
    } catch (error) {
      console.error("Error searching products:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (keyword.trim()) {
        saveRecentSearch(keyword.trim());
        navigate(`/trang-chu/san-pham?keyword=${encodeURIComponent(keyword)}`);
        setShowResults(false);
        if (onClose) onClose();
      }
    }
  };

  const handleResultClick = (productId) => {
    if (keyword.trim()) {
      saveRecentSearch(keyword.trim());
    }
    navigate(`/trang-chu/san-pham/chi-tiet-san-pham/${productId}`);
    setShowResults(false);
    setKeyword("");
    if (onClose) onClose();
  };

  const handleViewAllResults = () => {
    if (keyword.trim()) {
      saveRecentSearch(keyword.trim());
      navigate(`/trang-chu/san-pham?keyword=${encodeURIComponent(keyword)}`);
      setShowResults(false);
      if (onClose) onClose();
    }
  };

  const handleRecentSearchClick = (term) => {
    setKeyword(term);
    navigate(`/trang-chu/san-pham?keyword=${encodeURIComponent(term)}`);
    setShowResults(false);
    if (onClose) onClose();
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        ref={searchRef}
      >
        {/* Search header */}
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-indigo-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm sản phẩm thời trang công nghệ..."
              className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
              autoFocus
            />
            {keyword && (
              <button
                className="absolute right-4 text-gray-400 hover:text-indigo-600 transition-colors"
                onClick={() => {
                  setKeyword("");
                  inputRef.current.focus();
                }}
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <AnimatePresence>
          {(showResults || loading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[60vh] overflow-y-auto"
            >
              {/* Loading state */}
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Đang tìm kiếm...</p>
                </div>
              ) : keyword.trim().length >= 1 && results.length > 0 ? (
                // Results found
                <>
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">
                      Kết quả tìm kiếm
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {results.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{
                          backgroundColor: "rgba(238, 242, 255, 0.5)",
                        }}
                        className="flex items-center p-4 cursor-pointer transition-colors"
                        onClick={() => handleResultClick(product.id)}
                      >
                        <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            className="w-full h-full object-cover"
                            src={`http://localhost:8088/api/v1/product-images/get-image/${product.imageUrl}`}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/300x300/indigo/white?text=Fashion+Tech";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm font-bold text-indigo-600 mt-1">
                            {product.price?.toLocaleString("vi-VN") || "0"}₫
                          </p>
                          {product.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 text-indigo-500">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div
                    className="p-4 text-center border-t border-gray-100 text-sm font-medium text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                    onClick={handleViewAllResults}
                  >
                    <span className="inline-flex items-center">
                      Xem tất cả kết quả cho "{keyword}"
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </>
              ) : keyword.trim().length >= 1 ? (
                // No results found
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                    <Search className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Không tìm thấy sản phẩm nào phù hợp với "{keyword}". Vui
                    lòng thử lại với từ khóa khác.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        navigate("/trang-chu/san-pham");
                        if (onClose) onClose();
                      }}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                </div>
              ) : recentSearches.length > 0 ? (
                // Recent searches
                <>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-500">
                      Tìm kiếm gần đây
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {recentSearches.map((term, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 hover:bg-indigo-50 cursor-pointer transition-colors"
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        <div className="w-8 h-8 flex-shrink-0 mr-3 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Search className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {term}
                          </p>
                        </div>
                        <div className="ml-4 text-indigo-500">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {/* Popular categories - shown when no keyword */}
              {keyword.trim().length === 0 && (
                <div className="p-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Danh mục phổ biến
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Điện thoại thông minh",
                      "Laptop",
                      "Đồng hồ thông minh",
                      "Phụ kiện công nghệ",
                      "Máy tính bảng",
                      "Loa công nghệ",
                    ].map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                        onClick={() => {
                          navigate(
                            `/trang-chu/san-pham?category=${encodeURIComponent(
                              category
                            )}`
                          );
                          if (onClose) onClose();
                        }}
                      >
                        <div className="w-6 h-6 flex-shrink-0 mr-2 bg-indigo-100 rounded-full flex items-center justify-center">
                          <ShoppingBag className="h-3 w-3 text-indigo-500" />
                        </div>
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {category}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
          Nhấn Enter để tìm kiếm hoặc ESC để đóng
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchProduct;
