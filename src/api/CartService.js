import callApi from "./apiService";

const CartService = {
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   * @returns {Promise<Object>} Thông tin giỏ hàng
   */
  getAllcarts: async () => {
    return callApi("/cart/get-all", "GET");
  },

  /**
   * Lấy giỏ hàng của người dùng hiện tại
   * @returns {Promise<Object>} Thông tin giỏ hàng
   */
  getCurrentUserCart: async () => {
    return callApi("/cart", "GET");
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param {Object} itemData - Dữ liệu sản phẩm cần thêm
   * @param {number} itemData.productId - ID sản phẩm
   * @param {number} itemData.quantity - Số lượng
   * @returns {Promise<Object>} Giỏ hàng sau khi cập nhật
   */
  addItemToCart: async (itemData) => {
    return callApi("/cart/items", "POST", itemData);
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   * @param {number} itemId - ID sản phẩm trong giỏ hàng
   * @param {number} quantity - Số lượng mới
   * @returns {Promise<Object>} Giỏ hàng sau khi cập nhật
   */
  updateCartItem: async (itemId, quantity) => {
    return callApi(`/cart/items/${itemId}`, "PUT", { quantity });
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * @param {number} itemId - ID sản phẩm trong giỏ hàng
   * @returns {Promise<Object>} Giỏ hàng sau khi cập nhật
   */
  removeItemFromCart: async (itemId) => {
    return callApi(`/cart/items/${itemId}`, "DELETE");
  },

  /**
   * Xóa toàn bộ giỏ hàng
   * @returns {Promise<void>}
   */
  clearCart: async () => {
    return callApi("/cart", "DELETE");
  },

  /**
   * Lấy giỏ hàng của một người dùng bất kỳ (Admin only)
   * @param {number} userId - ID của người dùng
   * @returns {Promise<Object>} Giỏ hàng của người dùng
   */
  getCartByUserId: async (userId) => {
    return callApi(`/cart/admin/users/${userId}`, "GET");
  },
};

export default CartService;
