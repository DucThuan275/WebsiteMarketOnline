import { useState, useEffect } from "react";
import BannerService from "../../../api/BannerService";
import { Link } from "react-router-dom";
import {
  Edit,
  Eye,
  Trash2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  ImageIcon,
  Link2,
  Plus,
} from "lucide-react";

const ListBanner = ({ onEdit, refreshTrigger }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [expandedBanner, setExpandedBanner] = useState(null);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await BannerService.getAllBanners();
      setBanners(data);
      setError("");
    } catch (err) {
      setError("Không thể tải danh sách banner");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load banners when component mounts and when refreshTrigger changes
  useEffect(() => {
    fetchBanners();
  }, [refreshTrigger]);

  // Handle status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      await BannerService.updateBannerStatus(id, !currentStatus);
      fetchBanners();
      setStatusMessage({
        type: "success",
        message: `Banner đã được ${
          !currentStatus ? "kích hoạt" : "vô hiệu hóa"
        } thành công`,
      });

      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: "", message: "" });
      }, 3000);
    } catch (err) {
      setError("Không thể cập nhật trạng thái banner");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle banner deletion
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await BannerService.deleteBanner(id);
      fetchBanners();
      setStatusMessage({
        type: "success",
        message: "Banner đã được xóa thành công",
      });

      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: "", message: "" });
      }, 3000);
    } catch (err) {
      setError("Không thể xóa banner");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle banner preview
  const toggleExpandBanner = (id) => {
    if (expandedBanner === id) {
      setExpandedBanner(null);
    } else {
      setExpandedBanner(id);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
           Quản lý Banner
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBanners}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
            <Link
              to="/admin/banners/new"
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors"
            >
              <Plus size={18} />
              Thêm banner
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {statusMessage.message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg flex items-center ${
            statusMessage.type === "success"
              ? "bg-green-900/20 border border-green-800/30 text-green-300"
              : "bg-red-900/20 border border-red-800/30 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <p>{statusMessage.message}</p>
        </div>
      )}

      <div className="p-6">
        {loading && !banners.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-gray-750 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <ImageIcon size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">
              Không tìm thấy banner nào
            </p>
            <p className="text-gray-400 mt-2">
              Hãy tạo banner mới để hiển thị trên trang web của bạn
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`bg-gray-750 rounded-lg overflow-hidden transition-all duration-200 ${
                  !banner.isActive ? "opacity-70" : ""
                }`}
              >
                <div className="p-4 flex flex-col md:flex-row gap-4">
                  <div
                    className="w-full md:w-1/3 h-48 bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => toggleExpandBanner(banner.id)}
                  >
                    <img
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      src={`http://localhost:8088/api/v1/banners/image/${banner.id}`}
                      alt={banner.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400/EEE/31343C";
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {banner.title}
                        </h3>
                        <div className="flex items-center mt-1 space-x-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              banner.isActive
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {banner.isActive
                              ? "Đang hoạt động"
                              : "Không hoạt động"}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Vị trí: {banner.displayOrder}
                          </span>
                        </div>
                      </div>
                      <div className="flex mt-4 md:mt-0 items-center justify-end gap-2">
                        <button
                          onClick={() => toggleExpandBanner(banner.id)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                          <span className="sr-only">Chi tiết</span>
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(banner)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                          <span className="sr-only">Sửa</span>
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(banner.id, banner.isActive)
                          }
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title={banner.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {banner.isActive ? (
                            <X size={16} />
                          ) : (
                            <Check size={16} />
                          )}
                          <span className="sr-only">
                            {banner.isActive ? "Vô hiệu" : "Kích hoạt"}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn xóa banner này?"
                              )
                            ) {
                              handleDelete(banner.id);
                            }
                          }}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-red-600 rounded-md transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Xóa</span>
                        </button>
                      </div>
                    </div>

                    {banner.description && (
                      <p className="text-gray-300 mt-2 line-clamp-2">
                        {banner.description}
                      </p>
                    )}

                    {banner.linkUrl && (
                      <div className="mt-2">
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:text-pink-300 hover:underline flex items-center"
                        >
                          <Link2 className="h-4 w-4 mr-1" />
                          {banner.linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {expandedBanner === banner.id && (
                  <div className="p-4 bg-gray-700 border-t border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">
                          Thông tin chi tiết
                        </h4>
                        <div className="space-y-2">
                          <p className="text-white">
                            <span className="text-gray-400">ID:</span>{" "}
                            {banner.id}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Tiêu đề:</span>{" "}
                            {banner.title}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Mô tả:</span>{" "}
                            {banner.description || "Không có mô tả"}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">
                              Vị trí hiển thị:
                            </span>{" "}
                            {banner.displayOrder}
                          </p>
                          <p className="text-white">
                            <span className="text-gray-400">Trạng thái:</span>
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                banner.isActive
                                  ? "bg-green-900 text-green-300"
                                  : "bg-red-900 text-red-300"
                              }`}
                            >
                              {banner.isActive
                                ? "Đang hoạt động"
                                : "Không hoạt động"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">
                          Hình ảnh
                        </h4>
                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            className="w-full h-auto max-h-64 object-contain"
                            src={`http://localhost:8088/api/v1/banners/image/${banner.id}`}
                            alt={banner.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/600x400/EEE/31343C";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBanner;
