"use client";

import { useState, useEffect, useContext, createContext } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Create a context to manage transition state
const TransitionContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
  previousPath: null,
  currentPath: null,
});

// Provider component to wrap around the app
export const TransitionProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);

  return (
    <TransitionContext.Provider
      value={{
        isLoading,
        setIsLoading,
        previousPath,
        setPreviousPath,
        currentPath,
        setCurrentPath,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};

// Hook to use the transition context
export const useTransition = () => useContext(TransitionContext);

const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
      setProgress(0);

      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until actually loaded
        });
      }, 100);

      // Complete the transition after animation
      const timeout = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setDisplayLocation(location);
          setTransitionStage("fadeIn");
          clearInterval(progressInterval);
        }, 100);
      }, 200);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timeout);
      };
    }
  }, [location, displayLocation]);

  return (
    <>
      {/* Progress bar at top of screen */}
      <AnimatePresence>
        {transitionStage === "fadeOut" && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            exit={{ width: "100%", transition: { duration: 0.2 } }}
            className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 z-[9999]"
          />
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      <AnimatePresence>
        {transitionStage === "fadeOut" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center">
              {/* Tech fashion logo animation */}
              <div className="relative mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center"
                >
                  <span className="text-white font-bold text-2xl">VT</span>
                </motion.div>

                {/* Tech circuit lines */}
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="absolute -top-3 -left-12 w-10 h-px bg-indigo-400"
                ></motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{
                    duration: 1.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.2,
                  }}
                  className="absolute -bottom-3 -right-12 w-10 h-px bg-purple-400"
                ></motion.div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.5,
                  }}
                  className="absolute -right-3 -top-12 w-px h-10 bg-indigo-400"
                ></motion.div>
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{
                    duration: 1.7,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: 0.7,
                  }}
                  className="absolute -left-3 -bottom-12 w-px h-10 bg-purple-400"
                ></motion.div>
              </div>

              {/* Loading text with fashion tech branding */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-800 font-medium text-center"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  VDUCKTIE STORE
                </span>
                <br />
                <span className="text-sm text-gray-500">Đang tải trang...</span>
              </motion.p>

              {/* Progress percentage */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm font-medium text-indigo-600"
              >
                {Math.round(progress)}%
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayLocation.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="page-content"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PageTransition;
