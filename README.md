# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Market Online Website
## Giới Thiệu
Dự án này là hệ thống **chợ online** cho phép người dùng mua bán đồ cũ. Người dùng có thể đăng ký, đăng nhập, đăng tin bán sản phẩm, tìm kiếm và lọc sản phẩm, đánh giá sản phẩm, và quản lý danh sách yêu thích. Quản trị viên có thể quản lý sản phẩm, đơn hàng, và kiểm duyệt các đánh giá.
Kiến Trúc Dự Án
## Kiến Trúc Tổng Thể
Frontend: ReactJS (Single Page Application) kết hợp với TailwindCSS cho giao diện.
Backend: Java Spring Boot (API RESTful) - chạy cục bộ tại `localhost:8088`.
## Cơ sở dữ liệu: MySQL.
## Cấu Trúc Thư Mục
src/
├── assets/           # Hình ảnh, biểu tượng, logo
├── components/       # Các component dùng chung (Navbar, Footer, Sidebar...)
├── pages/            # Các trang chính (Home, ProductDetail, Cart, AdminDashboard...)
├── services/         # Giao tiếp API bằng axios (ProductService, UserService...)
├── layouts/          # Các layout chính (AdminLayout, MainLayout...)
├── routes/           # Định tuyến cho toàn bộ ứng dụng
├── utils/            # Các hàm tiện ích như format ngày, tính giá...
├── App.js            # Component gốc
└── index.js          # Điểm khởi tạo ReactDOM
## Công Nghệ Sử Dụng
##Frontend
1. ReactJS: Thư viện JavaScript để xây dựng giao diện người dùng.
2. React Router DOM: Định tuyến giữa các trang (Home, ProductDetail, Cart, v.v.).
3. TailwindCSS: Khung thiết kế CSS giúp tạo giao diện đẹp và responsive.
4. Axios: Thư viện để gọi API từ frontend.
5. Framer Motion & GSAP: Dùng cho animation mượt mà trong UI.
6. React Icons & FontAwesome: Biểu tượng cho giao diện.
## Backend
1. Java Spring Boot: Xây dựng API RESTful với các chức năng CRUD, xử lý đơn hàng, và xác thực người dùng.
2. JWT (JSON Web Token): Phương thức xác thực người dùng qua token.
3. MySQL: Hệ quản trị cơ sở dữ liệu để lưu trữ thông tin người dùng, sản phẩm, đơn hàng, v.v.
Tiện Ích và Thư Viện Hỗ Trợ
1. Chart.js: Hiển thị biểu đồ thống kê bán hàng.
2. Date-fns: Xử lý và định dạng ngày tháng.
3. Jwt-decode: Giải mã token JWT.
4. Dompurify: Làm sạch nội dung HTML để ngăn ngừa XSS.
5. React Toastify: Hiển thị thông báo popup.
6. XLSX: Xuất dữ liệu ra file Excel (ví dụ danh sách đơn hàng).
## Kiểm Thử
1. Jest & React Testing Library: Dùng để kiểm thử các component React.
## Chức Năng Chính
Người Dùng
1. Đăng ký / Đăng nhập / Đổi mật khẩu.
2. Tìm kiếm, lọc, và mua sản phẩm.
3. Đánh giá sản phẩm, quản lý tài khoản.
4. Quản lý đơn hàng và thanh toán trực tuyến.
Quản Trị Viên
1. Quản lý sản phẩm: Thêm, sửa, xóa sản phẩm.
2. Quản lý danh mục, thương hiệu.
3. Quản lý đơn hàng, thống kê bán hàng.
4. Kiểm duyệt đánh giá và sản phẩm yêu thích.
## Cài Đặt Dự Án
Clone Repository
git clone DucThuan275/WebsiteMarketOnline
## Cài đặt các phụ thuộc
cd market-online-website
npm install
## Chạy dự án trên localhost
npm start
Dự án sẽ chạy trên http://localhost:3000 và có thể truy cập backend ở http://localhost:8088.
## Thư Viện và Công Cụ Sử Dụng
## Frontend
react, react-dom: Thư viện chính để xây dựng UI
react-router-dom: Định tuyến giữa các trang
axios: Gọi API đến server
tailwindcss: Tạo giao diện responsive, hiện đại
react-scripts: Công cụ build, run, test
## Giao Diện và Hình Ảnh
react-icons, @fortawesome/*: Biểu tượng và icons
framer-motion: Animation mượt mà
gsap: Animation nâng cao
react-image-lightbox: Xem ảnh chi tiết sản phẩm
Tiện Ích và Xử Lý Dữ Liệu
chart.js: Hiển thị biểu đồ thống kê bán hàng
date-fns: Xử lý và định dạng ngày tháng
jwt-decode: Giải mã token JWT
dompurify: Làm sạch nội dung HTML để chống XSS
xlsx: Xuất dữ liệu ra file Excel
react-toastify: Hiển thị thông báo popup
## Cập Nhật Trong Tương Lai
1. Tính năng: Triển khai chức năng báo cáo chi tiết doanh thu, lợi nhuận cho người bán và quản trị viên.
2. Thêm API: Tính năng gợi ý sản phẩm dựa trên lịch sử mua hàng và đánh giá của người dùng.
3. Tối ưu hóa UI/UX: Cải thiện giao diện người dùng với các hiệu ứng và animation mượt mà hơn.
## License
Dự án này sử dụng giấy phép MIT. Xem chi tiết LICENSE.
