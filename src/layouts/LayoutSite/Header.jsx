"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import UserService from "../../api/UserService"
import userLoginService from "../../api/userLoginService"
import SearchProduct from "../../components/SearchProduct"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Use the cart context instead of local state
  const { cartItemCount } = useCart()

  useEffect(() => {
    // Check if user is logged in
    const authToken = localStorage.getItem("authToken")
    if (authToken) {
      setIsLoggedIn(true)

      // Fetch user profile data using UserService
      const fetchUserData = async () => {
        try {
          const userData = await UserService.getCurrentUserProfile()
          if (userData && userData.firstname) {
            setUserName(userData.firstname)
          } else {
            setUserName("User") // Fallback if name not found
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUserName("User")
        }
      }

      fetchUserData()
    }

    // Add scroll event listener for sticky header effect
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleLogout = async () => {
    await userLoginService.logout()
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <header
      className={`bg-slate-900 z-50 transition-all duration-300 ${scrolled ? "shadow-md" : "shadow-sm"} sticky top-0`}
    >
      {/* Top bar with promotions */}
      <div className="bg-blue-600 text-white text-center py-2 text-xs md:text-sm font-light">
        <p className="px-4">Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫ | Bảo hành chính hãng 12 tháng</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden flex items-center text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/trang-chu"
              className="font-sans text-2xl md:text-3xl font-bold tracking-wider text-white flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              VDUCKTIE
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden lg:flex space-x-8">
            <Link
              to="/trang-chu"
              className="text-gray-300 hover:text-white font-medium text-sm uppercase tracking-wide py-2 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
            >
              Trang chủ
            </Link>
            <Link
              to="/trang-chu/san-pham-moi"
              className="text-gray-300 hover:text-white font-medium text-sm uppercase tracking-wide py-2 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
            >
              Sản phẩm mới
            </Link>
            <Link
              to="/trang-chu/gioi-thieu"
              className="text-gray-300 hover:text-white font-medium text-sm uppercase tracking-wide py-2 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
            >
              Giới thiệu
            </Link>
            <Link
              to="/trang-chu/san-pham"
              className="text-gray-300 hover:text-white font-medium text-sm uppercase tracking-wide py-2 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
            >
              Tất cả sản phẩm
            </Link>
            <Link
              to="/trang-chu/bai-viet"
              className="text-gray-300 hover:text-white font-medium text-sm uppercase tracking-wide py-2 border-b-2 border-transparent hover:border-blue-500 transition-all duration-200"
            >
              Bài viết
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Search icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-300 hover:text-white focus:outline-none transition-colors"
              aria-label="Search"
            >
              {isSearchOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>

            {/* User account */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none transition-colors flex items-center"
                aria-label="User account"
              >
                {isLoggedIn ? (
                  <div className="flex items-center">
                    <span className="hidden md:block mr-2 text-sm font-medium">{userName}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                ) : (
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Đăng nhập
                  </Link>
                )}
              </button>

              {/* User dropdown menu */}
              {isLoggedIn && isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-700">
                  <Link
                    to="/trang-chu/nguoi-dung/thong-tin-nguoi-dung"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    Tài khoản của bạn
                  </Link>
                  <Link
                    to="/trang-chu/nguoi-dung/cap-nhat-thong-tin-nguoi-dung"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    Cập nhật tài khoản
                  </Link>
                  <Link
                    to="/trang-chu/nguoi-dung/san-pham"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    Sản phẩm của bạn
                  </Link>
                  <Link
                    to="/trang-chu/nguoi-dung/don-hang-cua-ban"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    Đơn hàng của bạn
                  </Link>
                  <Link
                    to="/trang-chu/nguoi-dung/vi-tien-cua-ban"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    Ví tiền của bạn
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {!isLoggedIn && (
              <Link to="/dang-ky" className="text-gray-300 hover:text-white text-sm font-medium">
                Đăng ký
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/trang-chu/yeu-thich" className="text-gray-300 hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Link>

            {/* Cart icon with item count */}
            <Link
              to="/trang-chu/gio-hang"
              className="relative text-gray-300 hover:text-white transition-colors cart-icon"
            >
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center transition-all duration-300">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* Search component - conditional rendering */}
        <SearchProduct isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-700">
            <nav className="flex flex-col py-4">
              <Link to="/trang-chu" className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium">
                Trang chủ
              </Link>
              <Link
                to="/trang-chu/san-pham-moi"
                className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium"
              >
                Sản phẩm mới
              </Link>
              <Link
                to="/trang-chu/gioi-thieu"
                className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium"
              >
                Giới thiệu
              </Link>
              <Link
                to="/trang-chu/san-pham"
                className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium"
              >
                Tất cả sản phẩm
              </Link>
              <Link
                to="/trang-chu/bai-viet"
                className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium"
              >
                Bài viết
              </Link>

              {!isLoggedIn && (
                <>
                  <Link to="/" className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium">
                    Đăng nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    className="py-3 px-4 text-gray-300 hover:bg-slate-800 hover:text-white font-medium"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

