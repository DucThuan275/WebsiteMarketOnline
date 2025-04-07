"use client"

import { Link, useLocation } from "react-router-dom"
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"
import {
  MdSettings,
  MdCategory,
  MdGroup,
  MdLabel,
  MdHome,
  MdShop2,
  MdProductionQuantityLimits,
  MdFavorite,
  MdReviews,
  MdWallet,
  MdPostAdd,
  MdMenu,
  MdClose,
} from "react-icons/md"
import { CgProductHunt } from "react-icons/cg"
import { useState, useEffect } from "react"
import authService from "../../api/authService"

export default function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
  }

  const isMenuItemActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  const menuItems = [
    { path: "/admin/home", label: "Dashboard", icon: <MdHome className="text-xl" /> },
    { path: "/admin/products", label: "Products", icon: <CgProductHunt className="text-xl" /> },
    { path: "/admin/categories", label: "Categories", icon: <MdCategory className="text-xl" /> },
    { path: "/admin/orders", label: "Orders", icon: <MdShop2 className="text-xl" /> },
    { path: "/admin/users", label: "Customers", icon: <MdGroup className="text-xl" /> },
    { path: "/admin/banners", label: "Banners", icon: <MdLabel className="text-xl" /> },
    { path: "/admin/posts", label: "Blog Posts", icon: <MdPostAdd className="text-xl" /> },
    { path: "/admin/reviews", label: "Reviews", icon: <MdReviews className="text-xl" /> },
    { path: "/admin/favourites", label: "Favorites", icon: <MdFavorite className="text-xl" /> },
    { path: "/admin/carts", label: "Abandoned Carts", icon: <MdProductionQuantityLimits className="text-xl" /> },
    { path: "/admin/wallets", label: "Payments", icon: <MdWallet className="text-xl" /> },
    { path: "/admin/configs", label: "Settings", icon: <MdSettings className="text-xl" /> },
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white md:hidden"
      >
        {mobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          mobileMenuOpen || windowWidth >= 768 ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-gray-100 transition-transform duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 flex flex-col justify-between`}
        style={{ maxHeight: "100vh" }}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                VDUCKTIE<span className="text-pink-500">ADMIN</span>
              </h2>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow py-5 px-4">
            <nav>
              <ul className="space-y-1">
                {menuItems.map(({ path, label, icon }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isMenuItemActive(path)
                          ? "bg-pink-600 text-white font-medium"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <span
                        className={`${isMenuItemActive(path) ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}
                      >
                        {icon}
                      </span>
                      <span className="text-sm font-medium">{label}</span>
                      {isMenuItemActive(path) && <span className="ml-auto w-1.5 h-5 bg-white rounded-full"></span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                <FaUserCircle className="text-2xl text-pink-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">Admin User</h4>
                  <p className="text-xs text-gray-400">Fashion Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/admin/change-password"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-800 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  <MdSettings className="text-lg" />
                  <span>Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-pink-600 rounded-lg text-sm font-medium text-white hover:bg-pink-700 transition-colors"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && windowWidth < 768 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleMobileMenu}></div>
      )}
    </>
  )
}

