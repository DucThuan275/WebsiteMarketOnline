"use client"

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fashion-related words for the background
  const fashionWords = [
    "Style", "Trend", "Vogue", "Chic", "Fashion", 
    "Elegant", "Design", "Couture", "Runway", "Collection",
    "Fabric", "Luxury", "Modern", "Classic", "Seasonal",
    "Apparel", "Accessory", "Ensemble", "Boutique", "Premium"
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          {fashionWords.map((word, index) => (
            <motion.div
              key={index}
              className="absolute text-black font-light"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.7, 
                scale: 1,
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.2,
                ease: "easeInOut"
              }}
              style={{
                fontSize: `${Math.random() * 1.5 + 0.8}rem`,
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-rose-100 to-amber-100 opacity-50" />
      <div className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-l from-rose-100 to-amber-100 opacity-50" />
      
      {/* Main content container */}
      <motion.div 
        className="relative z-10 w-full max-w-3xl mx-auto bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-amber-400" />
        
        <div className="p-8 md:p-12">
          {/* Brand logo */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="text-2xl font-bold tracking-tight text-amber-800 border-b-2 border-amber-300 pb-1">
              VDUCKTIE
              <span className="text-rose-500 ml-1">®</span>
            </div>
          </motion.div>
          
          {/* 404 text with animation */}
          <div className="text-center mb-8">
            <motion.h1 
              className="relative text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500 inline-block"
              aria-label="404 - Page not found"
            >
              <AnimatePresence>
                {mounted && (
                  <>
                    <motion.span
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      4
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 0.7,
                        scale: { duration: 0.7 },
                        rotate: { repeat: Infinity, repeatDelay: 3, duration: 1.5 }
                      }}
                      className="inline-block"
                    >
                      0
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      4
                    </motion.span>
                  </>
                )}
              </AnimatePresence>
            </motion.h1>
            
            <motion.div
              className="h-0.5 w-32 bg-gradient-to-r from-rose-300 to-amber-300 mx-auto my-6"
              initial={{ width: 0 }}
              animate={{ width: "8rem" }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            </motion.p>
          </div>
          
          {/* CTA button */}
          <motion.div 
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Link
              to="/"
              className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium transition duration-300 ease-out border-2 border-rose-500 rounded-full text-rose-500 hover:text-white"
              aria-label="Quay lại trang chủ"
            >
              <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-rose-500 group-hover:translate-x-0 ease">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </span>
              <span className="absolute flex items-center justify-center w-full h-full transition-all duration-300 transform group-hover:translate-x-full ease">Quay lại trang chủ</span>
              <span className="relative invisible">Quay lại trang chủ</span>
            </Link>
          </motion.div>
          
          {/* Navigation links */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-t border-gray-100 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <Link to="/" className="text-amber-600 hover:text-rose-500 transition-colors duration-300 flex flex-col items-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>Trang chủ</span>
            </Link>
            <Link to="/trang-chu/trang-don/gioi-thieu" className="text-amber-600 hover:text-rose-500 transition-colors duration-300 flex flex-col items-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Giới thiệu</span>
            </Link>
            <Link to="/trang-chu/lien-he" className="text-amber-600 hover:text-rose-500 transition-colors duration-300 flex flex-col items-center">
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span>Liên hệ</span>
            </Link>
          </motion.div>
          
          {/* Animated fashion elements */}
          <div className="absolute -right-12 -bottom-12 w-40 h-40 opacity-10">
            <motion.svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <path d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM50 90C27.9 90 10 72.1 10 50C10 27.9 27.9 10 50 10C72.1 10 90 27.9 90 50C90 72.1 72.1 90 50 90Z" fill="currentColor"/>
              <path d="M80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50Z" fill="currentColor"/>
            </motion.svg>
          </div>
          
          <div className="absolute -left-12 -top-12 w-40 h-40 opacity-10">
            <motion.svg 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              initial={{ rotate: 0 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <path d="M50 0L60 40H100L70 65L80 100L50 80L20 100L30 65L0 40H40L50 0Z" fill="currentColor"/>
            </motion.svg>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 py-4 px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} VDUCKTIE - Võ Đức Thuận</p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
