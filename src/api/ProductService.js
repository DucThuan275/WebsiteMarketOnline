import callApi from "./apiService";

const ProductService = {
  createProduct: async (productData, primaryImage, additionalImages = []) => {
    // Create FormData for the image files
    const formData = new FormData();

    // Convert productData to JSON string for requestDTO parameter
    const requestDTOJson = JSON.stringify(productData);

    // We'll pass requestDTO as a URL parameter, not in the FormData
    const params = {
      requestDTO: requestDTOJson,
    };

    // Append primary image if available
    if (primaryImage) {
      formData.append("image", primaryImage);
      console.log(
        `Adding primary image: ${primaryImage.name} (${primaryImage.type}, ${primaryImage.size} bytes)`
      );
    }

    // Append additional images if available
    if (additionalImages && additionalImages.length > 0) {
      additionalImages.forEach((file, index) => {
        if (file) {
          formData.append("additionalImages", file);
          console.log(
            `Adding additional image ${index + 1}: ${file.name} (${
              file.type
            }, ${file.size} bytes)`
          );
        }
      });
    }

    console.log("Sending product creation request with images");

    // Send the request with requestDTO as URL parameter and images in FormData
    return callApi("/products", "POST", formData, params, true);
  },
  /**
   * Search for products with attachments based on various criteria
   * @param {string} [keyword] - Search keyword for product name and description
   * @param {number} [productId] - Filter by specific product ID
   * @param {string} [fileType] - Filter by file type (e.g., "jpg", "pdf")
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortField="id"] - Field to sort by
   * @param {string} [sortDirection="asc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of products with attachments
   */
  searchProductAttachments: async (
    keyword,
    productId,
    fileType,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword: keyword || undefined,
      productId: productId || undefined,
      fileType: fileType || undefined,
      page,
      size,
      sortField,
      sortDirection,
    };

    // Filter out any keys with undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    return callApi("/products/search", "GET", null, filteredParams);
  },
  updateProduct: async (id, productData, imageFile) => {
    const formData = new FormData();

    // Add product data to form data
    Object.keys(productData).forEach((key) => {
      formData.append(key, productData[key]);
    });

    // If image file is provided, append it to the form data
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Log the formData to check its contents
    console.log("FormData with update image:", formData);

    // Send the request
    return callApi(`/products/${id}`, "PUT", formData, {}, true);
  },

  /**
   * Get all active products with pagination, sorting and filtering
   * @param {string} [keyword] - Search keyword for name or description
   * @param {number} [categoryId] - Filter by category ID
   * @param {number} [minPrice] - Filter by minimum price
   * @param {number} [maxPrice] - Filter by maximum price
   * @param {number} [minStock] - Filter by minimum stock quantity
   * @param {number} [maxStock] - Filter by maximum stock quantity
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortField="id"] - Field to sort by
   * @param {string} [sortDirection="asc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of active products
   */
  getActivaeProducts: async (
    keyword,
    categoryId,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      page,
      size,
      sortField,
      sortDirection,
    };
    return callApi("/products/active", "GET", null, params);
  },
  getActiveProducts: async (
    keyword,
    status,
    categoryId,
    sellerId,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword: keyword || undefined,
      status: status || undefined, // Only pass status if it's not null or undefined
      categoryId: categoryId || undefined,
      sellerId: sellerId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minStock: minStock || undefined,
      maxStock: maxStock || undefined,
      page,
      size,
      sortField,
      sortDirection,
    };

    // Filter out any keys with undefined values (to avoid passing them to the API)
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined)
    );

    // Make the API call with filteredParams
    return callApi("/products/active", "GET", null, filteredParams);
  },

  /**
   * Get a product by its ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  getProductById: async (id) => {
    return callApi(`/products/${id}`, "GET");
  },

  /**
   * Get all products with optional filtering, pagination and sorting
   * @param {string} [keyword] - Search keyword for name or description
   * @param {string} [status] - Filter by product status
   * @param {number} [categoryId] - Filter by category ID
   * @param {number} [sellerId] - Filter by seller ID
   * @param {number} [minPrice] - Filter by minimum price
   * @param {number} [maxPrice] - Filter by maximum price
   * @param {number} [minStock] - Filter by minimum stock quantity
   * @param {number} [maxStock] - Filter by maximum stock quantity
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortField="id"] - Field to sort by
   * @param {string} [sortDirection="asc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of products
   */
  getAllProducts: async (
    keyword,
    status,
    categoryId,
    sellerId,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword: keyword || undefined,
      status: status || undefined, // Only pass status if it's not null or undefined
      categoryId: categoryId || undefined,
      sellerId: sellerId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minStock: minStock || undefined,
      maxStock: maxStock || undefined,
      page,
      size,
      sortField,
      sortDirection,
    };

    // Filter out any keys with undefined values (to avoid passing them to the API)
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined)
    );

    // Make the API call with filteredParams
    return callApi("/products", "GET", null, filteredParams);
  },
  /**
   * Get related products based on a specific product ID
   * @param {number} productId - The ID of the product
   * @param {number} [limit=5] - Limit the number of related products
   * @param {number} [categoryId] - (Optional) Filter by category
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortField="createdAt"] - Field to sort by
   * @param {string} [sortDirection="desc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of related products
   */
  getRelatedProducts: async (
    productId,
    limit = 5,
    categoryId,
    page = 0,
    size = 10,
    sortField = "createdAt",
    sortDirection = "desc"
  ) => {
    const params = {
      limit,
      categoryId: categoryId || undefined,
      page,
      size,
      sortField,
      sortDirection,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    return callApi(
      `/products/related/${productId}`,
      "GET",
      null,
      filteredParams
    );
  },

  /**
   * Get products created by the current user with filtering, pagination and sorting
   * @param {string} [keyword] - Search keyword for name or description
   * @param {number} [categoryId] - Filter by category ID
   * @param {string} [status] - Filter by product status
   * @param {number} [minPrice] - Filter by minimum price
   * @param {number} [maxPrice] - Filter by maximum price
   * @param {number} [minStock] - Filter by minimum stock quantity
   * @param {number} [maxStock] - Filter by maximum stock quantity
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortField="id"] - Field to sort by
   * @param {string} [sortDirection="asc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of current user's products
   */
  getMyProducts: async (
    keyword,
    categoryId,
    status,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword: keyword || undefined,
      status: status || undefined, // Only pass status if it's not null or undefined
      categoryId: categoryId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minStock: minStock || undefined,
      maxStock: maxStock || undefined,
      page,
      size,
      sortField,
      sortDirection,
    };

    // Filter out any keys with undefined values (to avoid passing them to the API)
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined)
    );

    return callApi("/products/my-products", "GET", null, filteredParams);
  },
  getMyActiveProducts: async (
    keyword,
    categoryId,
    status,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword: keyword || undefined,
      status: status || undefined, // Only pass status if it's not null or undefined
      categoryId: categoryId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minStock: minStock || undefined,
      maxStock: maxStock || undefined,
      page,
      size,
      sortField,
      sortDirection,
    };

    // Filter out any keys with undefined values (to avoid passing them to the API)
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined)
    );

    return callApi("/products/my-active-products", "GET", null, filteredParams);
  },
  /**
   * Delete a product
   * @param {number} id - Product ID to delete
   * @returns {Promise<void>}
   */
  deleteProduct: async (id) => {
    return callApi(`/products/${id}`, "DELETE");
  },

  /**
   * Approve a product (Admin only)
   * @param {number} id - Product ID to approve
   * @returns {Promise<Object>} Approved product data
   */
  approveProduct: async (id) => {
    return callApi(`/products/${id}/approve`, "PUT");
  },
  /**
   * Deactivate a product (Admin only)
   * @param {number} id - Product ID to deactivate
   * @returns {Promise<Object>} Deactivated product data
   */
  deactivateProduct: async (id) => {
    return callApi(`/products/${id}/deactivate`, "PUT");
  },

  /**
   * Get all pending products with filtering, pagination and sorting (Admin only)
   * @param {string} [keyword] - Search keyword for name or description
   * @param {number} [categoryId] - Filter by category ID
   * @param {number} [minPrice] - Filter by minimum price
   * @param {number} [maxPrice] - Filter by maximum price
   * @param {number} [minStock] - Filter by minimum stock quantity
   * @param {number} [maxStock] - Filter by maximum stock quantity
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortField="id"] - Field to sort by
   * @param {string} [sortDirection="asc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of pending products
   */
  getPendingProducts: async (
    keyword,
    categoryId,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortField = "id",
    sortDirection = "asc"
  ) => {
    const params = {
      keyword,
      categoryId,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      page,
      size,
      sortField,
      sortDirection,
    };
    return callApi("/products/pending", "GET", null, params);
  },
  getProductImages: async (productId) => {
    return callApi(`/product-images/product/${productId}`, "GET");
  },
  /**
   * Get new products with pagination and optional limit
   * @param {number} [limit=10] - Maximum number of products to return
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortBy="createdAt"] - Field to sort by
   * @param {string} [direction="desc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of new products
   */
  getProductNew: async (
    limit = 10,
    page = 0,
    size = 10,
    sortBy = "createdAt",
    direction = "desc"
  ) => {
    const params = {
      limit,
      page,
      size,
      sortBy,
      direction,
    };
    return callApi("/products/new", "GET", null, params);
  },

  /**
   * Get products by category with filtering, pagination and sorting
   * @param {number} categoryId - Category ID to filter by (required)
   * @param {number} [minPrice] - Filter by minimum price
   * @param {number} [maxPrice] - Filter by maximum price
   * @param {number} [minStock] - Filter by minimum stock quantity
   * @param {number} [maxStock] - Filter by maximum stock quantity
   * @param {number} [page=0] - Page number (0-based)
   * @param {number} [size=10] - Page size
   * @param {string} [sortBy="id"] - Field to sort by
   * @param {string} [direction="desc"] - Sort direction (asc or desc)
   * @returns {Promise<Object>} Paginated list of products in the specified category
   */
  getProductByCategory: async (
    categoryId,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    page = 0,
    size = 10,
    sortBy = "id",
    direction = "desc"
  ) => {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const params = {
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minStock: minStock || undefined,
      maxStock: maxStock || undefined,
      page,
      size,
      sortBy,
      direction,
    };

    // Filter out any keys with undefined values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined)
    );

    return callApi(
      `/products/category/${categoryId}`,
      "GET",
      null,
      filteredParams
    );
  },
};

export default ProductService;
