import callApi from "./apiService";

const WebsiteRevenueService = {
  /**
   * Lấy tất cả doanh thu của website với phân trang
   * @param {Object} pageable - Thông tin phân trang
   * @returns {Promise<Array>} Danh sách doanh thu của website
   */
  getAllRevenue: async (pageable) => {
    return callApi(
      `/website-revenue?page=${pageable.page}&size=${pageable.size}`,
      "GET"
    );
  },

  /**
   * Lấy tổng doanh thu của website
   * @returns {Promise<BigDecimal>} Tổng doanh thu của website
   */
  getTotalRevenue: async () => {
    return callApi("/website-revenue/total", "GET");
  },
};

export default WebsiteRevenueService;
