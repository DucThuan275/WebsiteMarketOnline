"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const FlyToCartAnimation = () => {
  const [items, setItems] = useState([]);

  // Function to add a new flying item
  const addItem = (productImage, startPosition, endPosition) => {
    const id = Date.now();
    setItems((prevItems) => [
      ...prevItems,
      {
        id,
        productImage,
        startPosition,
        endPosition,
        createdAt: Date.now(),
      },
    ]);

    // Remove the item after animation completes
    setTimeout(() => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }, 1200); // Slightly longer to ensure animation completes

    // Trigger cart icon pulse animation
    setTimeout(() => {
      const cartIcon = document.querySelector(".cart-icon");
      if (cartIcon) {
        cartIcon.classList.add("cart-pulse");
        setTimeout(() => {
          cartIcon.classList.remove("cart-pulse");
        }, 700);
      }
    }, 800); // Time when item reaches cart
  };

  // Clean up old items in case they weren't removed properly
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setItems((prevItems) =>
        prevItems.filter((item) => now - item.createdAt < 1500)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Expose the addItem function globally
  useEffect(() => {
    window.addFlyToCartItem = addItem;

    // Add CSS for cart pulse animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes cartPulse {
        0% { transform: scale(1); }
        25% { transform: scale(1.1) rotate(-5deg); }
        50% { transform: scale(1.3) rotate(5deg); }
        75% { transform: scale(1.1) rotate(-2deg); }
        100% { transform: scale(1) rotate(0); }
      }
      .cart-pulse {
        animation: cartPulse 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    `;
    document.head.appendChild(style);

    return () => {
      delete window.addFlyToCartItem;
      document.head.removeChild(style);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute rounded-lg overflow-hidden shadow-xl"
            style={{
              top: item.startPosition.y,
              left: item.startPosition.x,
              width: "64px",
              height: "64px",
              zIndex: 9999,
            }}
            initial={{
              scale: 0.8,
              opacity: 0,
              rotate: -10,
              y: -20,
              x: 0,
            }}
            animate={{
              top: item.endPosition.y,
              left: item.endPosition.x,
              scale: [0.8, 1, 0.6, 0.4],
              opacity: [0, 1, 0.8, 0],
              rotate: [0, 5, 0],
              y: [0, -40, 0],
              x: [0, 10, 0],
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.3, 0.8, 1],
            }}
          >
            <div className="w-full h-full relative">
              {/* Product image with border and subtle shadow */}
              <div className="absolute inset-0 bg-white rounded-lg p-1.5">
                {item.productImage ? (
                  <img
                    src={item.productImage}
                    alt="Product"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-product.svg";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 1.2, times: [0, 0.5, 1] }}
                style={{
                  boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.7)",
                  mixBlendMode: "overlay",
                }}
              />

              {/* Motion trail */}
              <motion.div
                className="absolute inset-0 bg-white rounded-lg"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ zIndex: -1 }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default FlyToCartAnimation;
