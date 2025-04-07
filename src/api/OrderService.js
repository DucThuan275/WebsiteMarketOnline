import callApi from "./apiService";

const OrderService = {
  createOrder: async (orderData) => {
    try {
      console.log("Sending order creation request with data:", orderData);
      const response = await callApi("/orders", "POST", orderData);
      console.log("Order creation response:", response);
      return response;
    } catch (error) {
      console.error("Error creating order:", error);
      // Rethrow the error with more details for better debugging
      if (error.response) {
        console.error("Server response:", error.response);
        throw new Error(
          `Server error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      }
      throw error;
    }
  },

  /**
   * Get order details by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrderById: async (orderId) => {
    return callApi(`/orders/${orderId}`, "GET");
  },
  /**
   * Get all orders for the current user
   * @returns {Promise<Array>} List of user's orders
   */
  getAllOrder: async () => {
    return callApi("/orders", "GET");
  },
  /**
   * Get all orders for the current user
   * @returns {Promise<Array>} List of user's orders
   */
  getCurrentUserOrders: async () => {
    return callApi("/orders/my-orders", "GET");
  },

  /**
   * Get orders by status (Admin only)
   * @param {string} status - Order status
   * @returns {Promise<Array>} List of orders with the specified status
   */
  getOrdersByStatus: async (status) => {
    return callApi(`/orders/status/${status}`, "GET");
  },

  /**
   * Get orders within a date range (Admin only)
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise<Array>} List of orders within the date range
   */
  getOrdersByDateRange: async (startDate, endDate) => {
    return callApi("/orders/date-range", "GET", null, { startDate, endDate });
  },

  /**
   * Update order status (Admin only)
   * @param {number} orderId - Order ID
   * @param {Object} statusUpdateData - New status details
   * @returns {Promise<Object>} Updated order data
   */
  updateOrderStatus: async (orderId, statusUpdateData) => {
    // Đã loại bỏ dấu ? thừa ở cuối URL
    return callApi(`/orders/${orderId}/status`, "PATCH", statusUpdateData);
  },

  /**
   * Cancel an order (User or Admin)
   * @param {number} orderId - Order ID
   * @returns {Promise<void>}
   */
  cancelOrder: async (orderId) => {
    return callApi(`/orders/${orderId}/cancel`, "POST");
  },

  /**
   * Delete an order (Admin only)
   * @param {number} orderId - Order ID
   * @returns {Promise<void>}
   */
  deleteOrder: async (orderId) => {
    return callApi(`/orders/${orderId}`, "DELETE");
  },
};

export default OrderService;
