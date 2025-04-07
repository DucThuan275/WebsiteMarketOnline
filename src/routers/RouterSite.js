import About from "../pages/frontend/About/About";
import Cart from "../pages/frontend/Cart/Cart";
import Checkout from "../pages/frontend/Checkout/Checkout";
import OrderConfirmation from "../pages/frontend/Checkout/OrderConfirmation";
import VNPayCallbackHandler from "../pages/frontend/Checkout/VNPayCallbackHandler";
import Favorite from "../pages/frontend/Favorite/Favorite";
import Home from "../pages/frontend/Home";
import Post from "../pages/frontend/Post/Post";
import PostDetail from "../pages/frontend/Post/PostDetail";
import DeleteProduct from "../pages/frontend/Product/DeleteProduct";
import Product from "../pages/frontend/Product/Product";
import ProductCreate from "../pages/frontend/Product/ProductCreate";
import ProductDetail from "../pages/frontend/Product/ProductDetail";
import ProductNew from "../pages/frontend/Product/ProductNew";
import GetMyOrders from "../pages/frontend/User/GetMyOrders";
import MyProductDetail from "../pages/frontend/User/MyProductDetail";
import MyProducts from "../pages/frontend/User/MyProducts";
import OrderDetails from "../pages/frontend/User/OrderDetails";
import Profile from "../pages/frontend/User/Profile";
import UpdateProfile from "../pages/frontend/User/UpdateProfile";
import Wallet from "../pages/frontend/User/Wallet";
const RouterSite = [
  {
    index: "/",
    element: <Home />,
  },
  {
    path: "trang-chu",
    element: <Home />,
  },
  {
    path: "trang-chu/san-pham-moi",
    element: <ProductNew />,
  },
  {
    path: "trang-chu/san-pham",
    element: <Product />,
  },
  {
    path: "trang-chu/gioi-thieu",
    element: <About />,
  },
  {
    path: "trang-chu/bai-viet",
    element: <Post />,
  },
  {
    path: "trang-chu/bai-viet/:id",
    element: <PostDetail />,
  },
  {
    path: "trang-chu/san-pham/chi-tiet-san-pham/:id",
    element: <ProductDetail />,
  },
  {
    path: "trang-chu/nguoi-dung/thong-tin-nguoi-dung",
    element: <Profile />,
  },
  {
    path: "trang-chu/nguoi-dung/cap-nhat-thong-tin-nguoi-dung",
    element: <UpdateProfile />,
  },
  {
    path: "trang-chu/nguoi-dung/don-hang-cua-ban",
    element: <GetMyOrders />,
  },
  {
    path: "trang-chu/nguoi-dung/san-pham",
    element: <MyProducts />,
  },
  {
    path: "trang-chu/nguoi-dung/them-san-pham",
    element: <ProductCreate />,
  },
  {
    path: "trang-chu/nguoi-dung/san-pham/:id/chinh-sua",
    element: <ProductCreate />,
  },
  {
    path: "trang-chu/nguoi-dung/san-pham/:id/xoa",
    element: <DeleteProduct />,
  },
  {
    path: "trang-chu/nguoi-dung/san-pham/chi-tiet-san-pham/:productId",
    element: <MyProductDetail />,
  },
  {
    path: "trang-chu/gio-hang",
    element: <Cart />,
  },
  {
    path: "trang-chu/yeu-thich",
    element: <Favorite />,
  },
  {
    path: "trang-chu/gio-hang/thanh-toan",
    element: <Checkout />,
  },
  {
    path: "trang-chu/gio-hang/thanh-toan/xac-nhan-don-hang/:orderId",
    element: <OrderConfirmation />,
  },
  {
    path: "/vnpay-callback",
    element: <VNPayCallbackHandler />,
  },
  {
    path: "/trang-chu/nguoi-dung/don-hang/:orderId",
    element: <OrderDetails />,
  },
  {
    path: "/trang-chu/nguoi-dung/vi-tien-cua-ban",
    element: <Wallet />,
  },
];
export default RouterSite;
