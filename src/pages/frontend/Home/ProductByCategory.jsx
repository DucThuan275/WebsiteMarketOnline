"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { ChevronRight, Filter, SlidersHorizontal, X } from 'lucide-react';
import CategoryService from '../../../api/CategoryService';
import ProductService from '../../../api/ProductService';
import ProductCard from '../../../components/ProductCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import { StaggerWhenVisible, animations } from "../../../utils/animation-utils"

const ProductByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("name_asc");
  const [pagination, setPagination] = useState({
    page: 0,
    size: 8,
    totalPages: 0,
    totalElements: 0,
    hasMore: true
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await CategoryService.getActiveCategories();
        
        const fetchedCategories = Array.isArray(response.data) ? response.data : [];
        setCategories(fetchedCategories);
        
        // Automatically select the first category if available
        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0]);
        }
      } catch (err) {
        setError("Failed to load categories");
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when a category is selected or sortOption changes
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Parse sort option
        const [sortBy, direction] = sortOption.split('_');
        
        const result = await ProductService.getProductByCategory(
          selectedCategory.id,
          undefined, // minPrice
          undefined, // maxPrice
          undefined, // minStock
          undefined, // maxStock
          pagination.page,
          pagination.size,
          sortBy,
          direction
        );
        
        setProducts(result.content || []);
        setPagination({
          ...pagination,
          totalPages: result.totalPages || 0,
          totalElements: result.totalElements || 0,
          hasMore: (pagination.page + 1) < (result.totalPages || 0)
        });
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, pagination.page, sortOption, pagination.size]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setPagination({ ...pagination, page: 0 }); // Reset to first page when changing category
    setProducts([]); // Clear products when changing category
  };

  const handleLoadMore = async () => {
    if (!pagination.hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      // Parse sort option
      const [sortBy, direction] = sortOption.split('_');
      
      const result = await ProductService.getProductByCategory(
        selectedCategory.id,
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // minStock
        undefined, // maxStock
        nextPage,
        pagination.size,
        sortBy,
        direction
      );
      
      const newProducts = result.content || [];
      
      // Append new products to existing ones
      setProducts(prevProducts => [...prevProducts, ...newProducts]);
      
      setPagination({
        ...pagination,
        page: nextPage,
        totalPages: result.totalPages || 0,
        totalElements: result.totalElements || 0,
        hasMore: (nextPage + 1) < (result.totalPages || 0)
      });
    } catch (error) {
      console.error("Failed to fetch more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPagination({ ...pagination, page: 0 }); // Reset to first page when changing sort
    setProducts([]); // Clear products when changing sort
  };

  const handleSizeChange = (newSize) => {
    setPagination({ ...pagination, size: newSize, page: 0 });
    setProducts([]); // Clear products when changing size
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Category header with background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-neutral-50 border-b"
      >
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-center mb-2"
          >
            Bộ sưu tập
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-neutral-600 text-center max-w-2xl mx-auto"
          >
            Khám phá các sản phẩm thời trang theo danh mục
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories Section - Styled as Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {loadingCategories ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="relative">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={animations.staggerContainer}
                className="flex overflow-x-auto pb-2 scrollbar-hide gap-2 md:gap-4 md:justify-center"
              >
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    variants={animations.fadeInUp}
                    custom={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 md:px-6 md:py-3 whitespace-nowrap transition-all rounded-full text-sm md:text-base ${
                      selectedCategory?.id === category.id
                        ? "bg-neutral-900 text-white font-medium"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </motion.div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden"></div>
            </div>
          )}
        </motion.div>

        {/* Filters and sorting */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-neutral-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
            </motion.button>
            
            <div className="hidden md:flex items-center gap-2">
              {[8, 16, 32].map((size) => (
                <motion.button 
                  key={size}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSizeChange(size)} 
                  className={`px-3 py-1 rounded-md text-sm ${pagination.size === size ? 'bg-neutral-900 text-white' : 'bg-neutral-100'}`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="w-full appearance-none bg-white border rounded-md py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              >
                <option value="name_asc">Tên: A-Z</option>
                <option value="name_desc">Tên: Z-A</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="createdAt_desc">Mới nhất</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
                <ChevronRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Filter panel - hidden by default */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-neutral-50 rounded-lg p-4 mb-6 border"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Lọc sản phẩm</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowFilters(false)} 
                  className="text-neutral-500 hover:text-neutral-800"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Từ" 
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <span>-</span>
                    <input 
                      type="number" 
                      placeholder="Đến" 
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Màu sắc</label>
                  <div className="flex flex-wrap gap-2">
                    {["black", "white", "red-500", "blue-500", "green-500"].map((color) => (
                      <motion.div 
                        key={color}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-6 h-6 rounded-full bg-${color} border cursor-pointer`}
                      ></motion.div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Kích thước</label>
                  <div className="flex flex-wrap gap-2">
                    {["S", "M", "L", "XL"].map((size) => (
                      <motion.button 
                        key={size}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="px-2 py-1 border rounded-md text-sm hover:bg-neutral-100"
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Áp dụng
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Section */}
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ErrorMessage message={error} />
          </motion.div>
        ) : (
          <>
            {loading && products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-20"
              >
                <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-800 rounded-full animate-spin"></div>
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16 bg-neutral-50 rounded-lg"
              >
                <SlidersHorizontal className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 text-lg mb-2">Không tìm thấy sản phẩm nào</p>
                <p className="text-neutral-500 mb-6">Vui lòng thử lại với danh mục khác hoặc điều chỉnh bộ lọc</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSortOption("name_asc");
                    setPagination({ ...pagination, page: 0 });
                  }}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Đặt lại bộ lọc
                </motion.button>
              </motion.div>
            ) : (
              <>
                <StaggerWhenVisible 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  staggerDelay={0.2}
                >
                  {products.map((product, index) => (
                    <motion.div 
                      key={product.id || index} 
                      variants={animations.fadeInUp}
                      whileHover={{ y: -10, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.3 }}
                      className="group transition-all duration-300 rounded-lg overflow-hidden"
                    >
                      {product ? (
                        <div className="product-card-wrapper">
                          <ProductCard product={product} />
                        </div>
                      ) : (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-red-500">Lỗi hiển thị sản phẩm</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </StaggerWhenVisible>

                {/* View More Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-12 flex flex-col items-center"
                >
                  <p className="text-neutral-500 text-sm mb-4">
                    Hiển thị {products.length} / {pagination.totalElements} sản phẩm
                  </p>
                  
                  {pagination.hasMore && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <span>Xem thêm sản phẩm</span>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
      
      {/* Featured section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className="bg-neutral-900 text-white py-16 mt-12"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-6"
            >
              Bộ sưu tập mùa thu 2025
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-neutral-300 mb-8 text-lg"
            >
              Khám phá những thiết kế mới nhất của chúng tôi, được tạo ra để nâng tầm phong cách của bạn
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors font-medium"
            >
              Khám phá ngay
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductByCategory;
