"use client"

import React from "react";
import { motion } from "framer-motion";
import ProductByCategory from "./ProductByCategory";
import ProductNew from "./ProductNew";
import Banner from "./Banner";
import PostNew from "./PostNew";

const Home = () => {
  // Define the staggered container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  // Define the animation for each section
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section variants={sectionVariants}>
        <Banner />
      </motion.section>
      
      <motion.section variants={sectionVariants}>
        <ProductByCategory />
      </motion.section>
      
      <motion.section variants={sectionVariants}>
        <ProductNew />
      </motion.section>
      
      <motion.section variants={sectionVariants}>
        <PostNew />
      </motion.section>
    </motion.div>
  );
};

export default Home;
