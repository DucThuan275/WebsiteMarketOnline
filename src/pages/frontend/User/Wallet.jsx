import React, { useState, useEffect } from "react";
import { Wallet as WalletIcon, RefreshCw, Download, Send } from "lucide-react";
import WalletService from "../../../api/WalletService";
import { Link } from "react-router-dom";

const Wallet = () => {
  // State management
  const [wallet, setWallet] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch wallet information on component mount
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const walletData = await WalletService.getWallet();
        setWallet(walletData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch wallet information");
        setLoading(false);
      }
    };

    fetchWalletInfo();
  }, []);

  // Handle withdrawal submission
  const handleWithdraw = async () => {
    // Reset previous messages
    setError("");
    setSuccessMessage("");

    // Validate withdrawal amount
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    if (amount > wallet.balance) {
      setError("Insufficient funds");
      return;
    }

    try {
      const result = await WalletService.withdrawFunds(amount);

      // Update wallet balance after successful withdrawal
      setWallet((prevWallet) => ({
        ...prevWallet,
        balance: prevWallet.balance - amount,
      }));

      setSuccessMessage(result);
      setWithdrawAmount("");
    } catch (err) {
      setError("Withdrawal failed. Please try again.");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">
          <RefreshCw className="w-10 h-10 text-blue-500" />
        </div>
        <span className="ml-2 text-gray-600">
          Loading wallet information...
        </span>
      </div>
    );
  }

  // Render error state
  if (error && !wallet) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link
              to="/trang-chu"
              className="text-gray-700 hover:text-gray-900 inline-flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Trang chủ
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <Link
                to="/trang-chu/nguoi-dung/thong-tin-nguoi-dung"
                className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2 text-sm font-medium"
              >
                Người dùng
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span
                className="text-gray-500 ml-1 md:ml-2 text-sm font-medium"
                aria-current="page"
              >
                Ví của bạn
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Wallet Header */}
        <div className="container mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white rounded-xl shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WalletIcon className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Ví của bạn</h2>
            </div>
            <button
              className="hover:bg-blue-700 p-2 rounded-full transition"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 mb-2">Số dư hiện tại</p>
            <p className="text-4xl font-extrabold text-green-600">
              {wallet.balance.toLocaleString()} VND
            </p>
          </div>

          {/* Withdrawal Section */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Nhập số tiền cần rút</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Nhập số tiền cần rút..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleWithdraw}
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Rút tiền
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {successMessage && (
              <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-green-600">{successMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-100 p-4 flex justify-around">
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Download className="w-6 h-6 mb-1" />
            <span className="text-sm">Deposit</span>
          </button>
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600">
            <Send className="w-6 h-6 mb-1" />
            <span className="text-sm">Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
