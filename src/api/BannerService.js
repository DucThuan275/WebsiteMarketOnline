import callApi from "./apiService";

const BannerService = {
  /**
   * Lấy danh sách banner đang hoạt động
   * @returns {Promise<Array>} Danh sách banner đang hoạt động
   */
  getActiveBanners: async () => {
    return callApi("/banners/list-banner", "GET");
  },

  /**
   * Lấy tất cả banner (Admin only)
   * @returns {Promise<Array>} Danh sách tất cả banner
   */
  getAllBanners: async () => {
    return callApi("/banners", "GET");
  },

  /**
   * Lấy thông tin banner theo ID (Admin only)
   * @param {number} id - ID của banner
   * @returns {Promise<Object>} Thông tin chi tiết banner
   */
  getBannerById: async (id) => {
    return callApi(`/banners/${id}`, "GET");
  },

  /**
   * Tạo banner mới (Admin only)
   * @param {Object} banner - Dữ liệu banner cần tạo
   * @param {string} banner.title - Tiêu đề banner
   * @param {string} banner.description - Mô tả banner
   * @param {string} banner.linkUrl - Đường dẫn khi click vào banner
   * @param {boolean} banner.isActive - Trạng thái hoạt động
   * @param {number} banner.displayOrder - Thứ tự hiển thị
   * @param {File} imageFile - File hình ảnh banner
   * @returns {Promise<Object>} Banner đã được tạo
   */
  createBanner: async (banner, imageFile) => {
    const formData = new FormData();

    // Thêm từng trường của banner riêng biệt vào formData
    // KHÔNG serialize toàn bộ đối tượng banner
    formData.append("id", "0");
    formData.append("title", banner.title || "");
    formData.append("description", banner.description || "");
    formData.append("linkUrl", banner.linkUrl || "");
    formData.append("displayOrder", banner.displayOrder || 0);
    formData.append("isActive", banner.isActive);

    // Thêm file hình ảnh vào formData
    formData.append("image", imageFile);

    return callApi("/banners", "POST", formData, {
      isMultipart: true,
    });
  },

  /**
   * Cập nhật thông tin banner (Admin only)
   * @param {number} id - ID của banner
   * @param {Object} banner - Dữ liệu banner cần cập nhật
   * @param {string} banner.title - Tiêu đề banner
   * @param {string} banner.description - Mô tả banner
   * @param {string} banner.linkUrl - Đường dẫn khi click vào banner
   * @param {boolean} banner.isActive - Trạng thái hoạt động
   * @param {number} banner.displayOrder - Thứ tự hiển thị
   * @param {File} [imageFile] - File hình ảnh banner (không bắt buộc)
   * @returns {Promise<Object>} Banner sau khi cập nhật
   */
  updateBanner: async (id, banner, imageFile) => {
    const formData = new FormData();

    // Thêm từng trường của banner riêng biệt vào formData
    formData.append("id", id);
    formData.append("title", banner.title || "");
    formData.append("description", banner.description || "");
    formData.append("linkUrl", banner.linkUrl || "");
    formData.append("displayOrder", banner.displayOrder || 0);
    formData.append("isActive", banner.isActive);

    // Thêm file hình ảnh vào formData nếu có
    if (imageFile) {
      formData.append("image", imageFile);
    }

    return callApi(`/banners/${id}`, "PUT", formData, {
      isMultipart: true,
    });
  },

  /**
   * Cập nhật trạng thái banner (Admin only)
   * @param {number} id - ID của banner
   * @param {boolean} isActive - Trạng thái hoạt động mới
   * @returns {Promise<Object>} Banner sau khi cập nhật
   */
  updateBannerStatus: async (id, isActive) => {
    return callApi(
      `/banners/${id}/status?isActive=${isActive}`,
      "PATCH"
    );
  },

  /**
   * Xóa banner (Admin only)
   * @param {number} id - ID của banner
   * @returns {Promise<void>}
   */
  deleteBanner: async (id) => {
    return callApi(`/banners/${id}`, "DELETE");
  },
};

export default BannerService;
