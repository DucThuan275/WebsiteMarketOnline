import callApi from "./apiService";

const WalletService = {
   /**
   * Lấy thông tin tất cả ví của người dùng
   * @returns {Promise<Object>} Thông tin ví của người dùng
   */
   getAllWallet: async () => {
    return callApi("/wallet/list", "GET");
  },

  /**
   * Lấy thông tin ví của người dùng hiện tại
   * @returns {Promise<Object>} Thông tin ví của người dùng
   */
  getWallet: async () => {
    return callApi("/wallet", "GET");
  },

  /**
   * Rút tiền từ ví của người dùng
   * @param {number} amount - Số tiền cần rút
   * @returns {Promise<String>} Thông báo về việc rút tiền
   */
  withdrawFunds: async (amount) => {
    const withdrawRequest = { amount };
    return callApi("/wallet/withdraw", "POST", withdrawRequest);
  },
};

export default WalletService;
