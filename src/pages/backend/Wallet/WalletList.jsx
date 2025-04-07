"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import WalletService from "../../../api/WalletService"
import { formatCurrency } from "../../../utils/formatters"
import { Wallet, RefreshCw, AlertCircle, Search, ChevronDown } from "lucide-react"

const WalletList = () => {
  // State lưu trữ danh sách ví và trạng thái loading/error
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })

  useEffect(() => {
    fetchWallets()
  }, []) // Chạy một lần khi component được mount

  // Gọi API để lấy thông tin tất cả các ví
  const fetchWallets = async () => {
    try {
      setLoading(true)
      const response = await WalletService.getAllWallet()
      setWallets(response) // Giả sử API trả về một mảng các ví
      setError(null)
    } catch (error) {
      setError("Có lỗi xảy ra khi tải danh sách ví.")
      console.error("Error fetching wallets:", error)
    } finally {
      setLoading(false)
    }
  }

  // Hàm sắp xếp
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Lọc và sắp xếp dữ liệu
  const getSortedWallets = () => {
    let sortableWallets = [...wallets]

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      sortableWallets = sortableWallets.filter(
        (wallet) =>
          wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wallet.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sắp xếp
    if (sortConfig.key) {
      sortableWallets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return sortableWallets
  }

  // Tính tổng số dư
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <motion.div
      className="bg-gray-900 rounded-xl shadow-xl overflow-hidden"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.div className="p-6 border-b border-gray-800" variants={itemVariants}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Wallet className="h-6 w-6 text-pink-500 mr-2" />
            <h1 className="text-2xl font-bold text-white">Quản lý ví người dùng</h1>
          </div>
          <motion.button
            onClick={fetchWallets}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="mx-6 mt-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center"
          variants={itemVariants}
        >
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      <motion.div className="p-6" variants={containerVariants}>
        <motion.div
          className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4"
          variants={itemVariants}
        >
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.div
            className="bg-gray-800 p-4 rounded-lg w-full md:w-auto"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-gray-400 text-sm">Tổng số dư</div>
            <div className="text-2xl font-bold text-pink-500">{formatCurrency(totalBalance)}</div>
          </motion.div>
        </motion.div>

        {loading ? (
          <motion.div className="flex justify-center items-center h-64" variants={itemVariants}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </motion.div>
        ) : getSortedWallets().length === 0 ? (
          <motion.div className="bg-gray-800 p-8 rounded-lg text-center" variants={itemVariants}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 text-gray-400 mb-4">
              <Wallet size={32} />
            </div>
            <p className="text-lg text-gray-300 font-medium">
              {searchTerm ? "Không tìm thấy ví nào phù hợp" : "Chưa có ví nào"}
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm ? "Vui lòng thử tìm kiếm với từ khóa khác" : "Hãy thêm ví mới để quản lý"}
            </p>
          </motion.div>
        ) : (
          <motion.div className="overflow-x-auto" variants={itemVariants}>
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
                    onClick={() => requestSort("balance")}
                  >
                    <div className="flex items-center">
                      Số dư ví
                      {sortConfig.key === "balance" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${sortConfig.direction === "descending" ? "transform rotate-180" : ""}`}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("userEmail")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortConfig.key === "userEmail" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${sortConfig.direction === "descending" ? "transform rotate-180" : ""}`}
                        />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {getSortedWallets().map((wallet, index) => (
                  <motion.tr
                    key={index}
                    className="hover:bg-gray-750 transition-colors"
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="show"
                    custom={index}
                    whileHover={{ backgroundColor: "rgba(55, 65, 81, 1)" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{wallet.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${wallet.balance > 0 ? "text-green-400" : "text-gray-300"}`}>
                        {formatCurrency(wallet.balance)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{wallet.userEmail}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default WalletList

