"use client";

import { createContext, useContext, useState, useEffect } from "react";
import ProductService from "../api/ProductService";
const ProductContext = createContext(undefined);

export function useProductContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error(
      "useProductContext must be used within a ProductContextProvider"
    );
  }
  return context;
}

export function ProductContextProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sử dụng ProductService của bạn để lấy dữ liệu sản phẩm
      const data = await ProductService.getActiveProducts(
        "", // keyword
        "", // status
        "", // categoryId
        "", // sellerId
        "", // minPrice
        "", // maxPrice
        "", // minStock
        "", // maxStock
        0, // page
        100, // size
        "id", // sortField
        "asc" // sortDirection
      );

      // Lưu dữ liệu sản phẩm vào state
      setProducts(data.content || data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Đã xảy ra lỗi khi tải dữ liệu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    products,
    isLoading,
    error,
    refreshProducts: fetchProducts,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}
