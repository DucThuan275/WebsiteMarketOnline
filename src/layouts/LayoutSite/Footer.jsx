import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter subscription */}
      <div className="bg-blue-900 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-semibold mb-3">Đăng Ký Nhận Thông Tin</h3>
            <p className="mb-6 text-gray-300 text-sm md:text-base">
              Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và công nghệ mới nhất trong ngành điện tử.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="flex-grow px-4 py-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Email address"
              />
              <button className="bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-600 transition-colors text-sm uppercase tracking-wider">
                Đăng Ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Shop column */}
          <div>
            <h4 className="font-medium text-lg mb-4 uppercase tracking-wide text-blue-400">
              Sản Phẩm
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/san-pham-moi"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Sản Phẩm Mới
                </Link>
              </li>
              <li>
                <Link
                  to="/dien-thoai"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Điện Thoại
                </Link>
              </li>
              <li>
                <Link
                  to="/laptop"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Laptop
                </Link>
              </li>
              <li>
                <Link
                  to="/phu-kien"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Phụ Kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/khuyen-mai"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Khuyến Mãi
                </Link>
              </li>
              <li>
                <Link
                  to="/smart-home"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Smart Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Information column */}
          <div>
            <h4 className="font-medium text-lg mb-4 uppercase tracking-wide text-blue-400">
              Thông Tin
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/gioi-thieu"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/cong-nghe-xanh"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Công Nghệ Xanh
                </Link>
              </li>
              <li>
                <Link
                  to="/tuyen-dung"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Tuyển Dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/dieu-khoan"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Điều Khoản & Điều Kiện
                </Link>
              </li>
              <li>
                <Link
                  to="/chinh-sach-bao-mat"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link
                  to="/he-thong-cua-hang"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Hệ Thống Cửa Hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service column */}
          <div>
            <h4 className="font-medium text-lg mb-4 uppercase tracking-wide text-blue-400">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/lien-he"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/van-chuyen"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Vận Chuyển & Bảo Hành
                </Link>
              </li>
              <li>
                <Link
                  to="/theo-doi-don-hang"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Theo Dõi Đơn Hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/ho-tro-ky-thuat"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Hỗ Trợ Kỹ Thuật
                </Link>
              </li>
              <li>
                <Link
                  to="/huong-dan-su-dung"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Hướng Dẫn Sử Dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="font-medium text-lg mb-4 uppercase tracking-wide text-blue-400">
              Liên Hệ
            </h4>
            <address className="not-italic text-gray-400 mb-4 text-sm">
              123 Đường Công Nghệ
              <br />
              Quận 9, TP. Hồ Chí Minh
              <br />
              Việt Nam
            </address>
            <p className="text-gray-400 mb-2 text-sm">
              Email:{" "}
              <a
                href="mailto:contact@techvn.com"
                className="hover:text-blue-400 transition-colors"
              >
                contact@techvn.com
              </a>
            </p>
            <p className="text-gray-400 mb-6 text-sm">
              Hotline:{" "}
              <a
                href="tel:+84901234567"
                className="hover:text-blue-400 transition-colors"
              >
                +84 90 123 4567
              </a>
            </p>

            {/* Social media */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar with copyright and payment methods */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} TECHVN. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center space-x-4">
              <img src="/api/placeholder/40/24" alt="Visa" className="h-6" />
              <img
                src="/api/placeholder/40/24"
                alt="Mastercard"
                className="h-6"
              />
              <img
                src="/api/placeholder/40/24"
                alt="American Express"
                className="h-6"
              />
              <img src="/api/placeholder/40/24" alt="PayPal" className="h-6" />
              <img src="/api/placeholder/40/24" alt="Momo" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;