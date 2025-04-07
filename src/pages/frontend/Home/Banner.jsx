"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BannerService from '../../../api/BannerService';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Fetch active banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await BannerService.getAllBanners();
        setBanners(data);
      } catch (err) {
        setError("Không thể tải danh sách banner");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners]);

  // Handle banner click to change the active banner
  const handleBannerClick = (index) => {
    setActiveBannerIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-4 border-b-transparent border-blue-600"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-red-600 py-4"
      >
        <p>{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[750px] overflow-hidden rounded-md"
    >
      {/* Banner container */}
      <AnimatePresence mode="wait">
        {banners.map((banner, index) => (
          index === activeBannerIndex && (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                className="w-full h-full object-cover"
                src={`http://localhost:8088/api/v1/banners/image/${banner.id}`}
                alt={banner.title}
              />
              
              {/* Optional: Animated text overlay */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent text-white"
              >
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-3xl font-bold mb-2"
                >
                  {banner.title || "Bộ sưu tập mới"}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="text-lg"
                >
                  {banner.description || "Khám phá ngay những sản phẩm mới nhất của chúng tôi"}
                </motion.p>
              </motion.div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Indicator dots */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        {banners.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === activeBannerIndex ? 'bg-blue-600' : 'bg-gray-400'
            }`}
            onClick={() => handleBannerClick(index)}
          ></motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Banner;
