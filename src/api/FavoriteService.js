import callApi from "./apiService";

const FavoriteService = {
  /**
   * Thêm một sản phẩm vào danh sách yêu thích
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<Object>} Dữ liệu sản phẩm yêu thích
   */
  addFavorite: async (productId) => {
    return callApi(`/favorites/add/${productId}`, "POST");
  },

  /**
   * Xóa một sản phẩm khỏi danh sách yêu thích
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<void>}
   */
  removeFavorite: async (productId) => {
    return callApi(`/favorites/remove/${productId}`, "DELETE");
  },

  /**
   * Lấy danh sách sản phẩm yêu thích của người dùng
   * @param {Object} params - Tham số phân trang ({ page, size })
   * @returns {Promise<Object>} Danh sách sản phẩm yêu thích
   */
  getUserFavorites: async (params = {}) => {
    return callApi(`/favorites/list`, "GET", null, params);
  },

  /**
   * Kiểm tra sản phẩm có trong danh sách yêu thích không
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<boolean>} True nếu có, False nếu không
   */
  isProductFavorited: async (productId) => {
    return callApi(`/favorites/exists/${productId}`, "GET");
  },

  /**
   * Lấy số lượng người dùng yêu thích một sản phẩm
   * @param {number} productId - ID sản phẩm
   * @returns {Promise<number>} Số lượng người yêu thích
   */
  getFavoriteCount: async (productId) => {
    return callApi(`/favorites/count/${productId}`, "GET");
  },
};

export default FavoriteService;
