import callApi from "./apiService";

const CategoryService = {
  /**
   * Get all active categories
   * @returns {Promise<Array>} List of active categories
   */
  getActiveCategories: async () => {
    return callApi("/categories/active", "GET");
  },

  /**
   * Get all categories (Admin only)
   * @returns {Promise<Array>} List of all categories
   */
  // getAllCategories: async () => {
  //   return callApi("/categories", "GET");
  // },
  getAllCategories: async () => {
    try {
      const response = await callApi("/categories", "GET");
      return response; // Return the full response to be processed in the component
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
    }
  },
  getCategories: async () => {
    try {
      const response = await callApi("/categories", "GET");
      // If the API returns the categories inside a `data` property, for example
      return response.data || response; // Adjust as necessary based on the actual response structure
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
    }
  },

  /**
   * Get subcategories of a specific category (Admin only)
   * @param {number} id - Parent category ID
   * @returns {Promise<Array>} List of subcategories
   */
  getSubCategories: async (id) => {
    return callApi(`/categories/${id}/sub-categories`, "GET");
  },

  /**
   * Create a new category (Admin only)
   * @param {Object} categoryData - Data for creating category
   * @returns {Promise<Object>} Created category data
   */
  createCategory: async (categoryData) => {
    return callApi("/categories", "POST", categoryData);
  },

  /**
   * Update a specific category (Admin only)
   * @param {number} id - Category ID to update
   * @param {Object} categoryData - Data for updating category
   * @returns {Promise<Object>} Updated category data
   */
  updateCategory: async (id, categoryData) => {
    return callApi(`/categories/${id}`, "PATCH", categoryData);
  },

  /**
   * Activate a specific category (Admin only)
   * @param {number} id - Category ID to activate
   * @returns {Promise<void>}
   */
  activateCategory: async (id) => {
    return callApi(`/categories/${id}/activate`, "PUT");
  },

  /**
   * Deactivate a specific category (Admin only)
   * @param {number} id - Category ID to deactivate
   * @returns {Promise<void>}
   */
  deactivateCategory: async (id) => {
    return callApi(`/categories/${id}/deactivate`, "PUT");
  },
  /**
   * Delete a specific category (Admin only)
   * @param {number} id - Category ID to delete
   * @returns {Promise<void>}
   */
  deleteCategory: async (id) => {
    return callApi(`/categories/${id}`, "DELETE");
  },
};

export default CategoryService;
