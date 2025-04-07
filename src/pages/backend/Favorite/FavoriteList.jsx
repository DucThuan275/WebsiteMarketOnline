import { useEffect, useState } from "react";
import FavoriteService from "../../../api/FavoriteService";
import { formatCurrency } from "../../../utils/formatters";
import { Heart, RefreshCw, AlertCircle, Search, ChevronDown, Trash2, Eye, ShoppingBag } from 'lucide-react';

const FavoriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
  });

  // Function to fetch favorites
  const fetchFavorites = async (page = 0) => {
    try {
      setLoading(true);
      const response = await FavoriteService.getUserFavorites({ page, size: 20 });
      // Get favorite count for each product and add it to the response
      const favoritesWithCount = await Promise.all(response.content.map(async (item) => {
        const count = await FavoriteService.getFavoriteCount(item.productId);
        return { ...item, favoriteCount: count };
      }));

      setFavorites(favoritesWithCount); // Update state with favorites including the count
      setPagination({
        currentPage: response.pageable.pageNumber,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm yêu thích");
      console.error("Error loading favorite products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(); // Fetch favorites when the component is mounted
  }, []);

  const handlePageChange = (page) => {
    setLoading(true);
    fetchFavorites(page);
  };

  // Hàm sắp xếp
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Lọc và sắp xếp dữ liệu
  const getSortedFavorites = () => {
    let sortableFavorites = [...favorites];
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      sortableFavorites = sortableFavorites.filter(
        item => 
          item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    if (sortConfig.key) {
      sortableFavorites.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableFavorites;
  };

  // Xử lý xóa yêu thích
  const handleRemoveFavorite = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?")) {
      try {
        await FavoriteService.removeFavorite(id);
        // Refresh the list after removing
        fetchFavorites(pagination.currentPage);
      } catch (error) {
        setError("Không thể xóa sản phẩm khỏi danh sách yêu thích");
        console.error("Error removing favorite:", error);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-pink-500 mr-2" />
            <h1 className="text-2xl font-bold text-white">Sản phẩm yêu thích</h1>
          </div>
          <button
            onClick={() => fetchFavorites(pagination.currentPage)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Tìm kiếm sản phẩm, người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg w-full md:w-auto">
            <div className="text-gray-400 text-sm">Tổng số yêu thích</div>
            <div className="text-2xl font-bold text-pink-500">{pagination.totalElements}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : getSortedFavorites().length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <Heart size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">
              {searchTerm ? "Không tìm thấy sản phẩm yêu thích nào phù hợp" : "Chưa có sản phẩm yêu thích nào"}
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm ? "Vui lòng thử tìm kiếm với từ khóa khác" : "Người dùng chưa thêm sản phẩm vào danh sách yêu thích"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("userName")}
                  >
                    <div className="flex items-center">
                      Tên người dùng
                      {sortConfig.key === "userName" && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortConfig.direction === "descending" ? "transform rotate-180" : ""}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("productName")}
                  >
                    <div className="flex items-center">
                      Tên sản phẩm
                      {sortConfig.key === "productName" && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortConfig.direction === "descending" ? "transform rotate-180" : ""}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("productPrice")}
                  >
                    <div className="flex items-center">
                      Giá
                      {sortConfig.key === "productPrice" && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortConfig.direction === "descending" ? "transform rotate-180" : ""}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("favoriteCount")}
                  >
                    <div className="flex items-center">
                      Lượt thích
                      {sortConfig.key === "favoriteCount" && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortConfig.direction === "descending" ? "transform rotate-180" : ""}`} 
                        />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {getSortedFavorites().map((item) => (
                  <tr key={item.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{item.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-pink-400">{formatCurrency(item.productPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-pink-500 mr-1.5" />
                        <span className="text-sm text-gray-300">{item.favoriteCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(`/products/${item.productId}`, '_blank')}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Xem sản phẩm"
                        >
                          <Eye size={16} />
                          <span className="sr-only">Xem</span>
                        </button>
                        <button
                          onClick={() => window.open(`/shop/product/${item.productId}`, '_blank')}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                          title="Đến trang mua hàng"
                        >
                          <ShoppingBag size={16} />
                          <span className="sr-only">Mua hàng</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="p-1.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-red-600 rounded-md transition-colors"
                          title="Xóa khỏi yêu thích"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(0)}
                disabled={pagination.currentPage <= 0}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">First page</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 0}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Previous page</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Show 5 pages max, centered around current page
                  let pageToShow;
                  if (pagination.totalPages <= 5) {
                    pageToShow = i;
                  } else {
                    const start = Math.max(0, Math.min(pagination.currentPage - 2, pagination.totalPages - 5));
                    pageToShow = start + i;
                  }
                  
                  return (
                    <button
                      key={pageToShow}
                      onClick={() => handlePageChange(pageToShow)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        pagination.currentPage === pageToShow
                          ? "bg-pink-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      {pageToShow + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Next page</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.totalPages - 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="p-2 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="sr-only">Last page</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteList;
