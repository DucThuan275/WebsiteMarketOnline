// Animation utility functions for reusable animations
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

// Custom hook to detect when element is in viewport
export const useElementInView = (
  ref,
  options = { once: true, amount: 0.2 }
) => {
  const isInView = useInView(ref, options);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated && options.once) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, options.once]);

  return options.once ? hasAnimated || isInView : isInView;
};

// Common animation variants
export const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  },

  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },

  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },

  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },

  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },

  staggerFaster: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  staggerSlower: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  },

  // For elements that should animate when scrolled into view
  scrollReveal: (delay = 0) => ({
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: "easeOut",
      },
    },
  }),
};

// Component for elements that animate when they come into view
export const AnimateWhenVisible = ({ children, variants, className }) => {
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

// Component for staggered children animations
export const StaggerContainer = ({
  children,
  className,
  delay = 0.1,
  staggerDelay = 0.2,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Component for staggered children that animate when in view
export const StaggerWhenVisible = ({
  children,
  className,
  delay = 0.1,
  staggerDelay = 0.2,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
