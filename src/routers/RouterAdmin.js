import LayoutAdmin from "../layouts/LayoutAdmin";
import Login from "../components/Login";
import Register from "../components/Register";
import Dashboard from "../pages/backend/Dashboard";
import AdminGuard from "../utils/AdminGuard";
import Unauthorized from "../components/Unauthorized";
import UserList from "../pages/backend/User/UserList";
import UserDetail from "../pages/backend/User/UserDetail";
import ProductList from "../pages/backend/Product/ProductList";
import ProductForm from "../pages/backend/Product/ProductForm";
import ProductDetail from "../pages/backend/Product/ProductDetail";
import DeleteProduct from "../pages/backend/Product/DeleteProduct";
import ProductStatusChange from "../pages/backend/Product/ProductStatusChange";
import CategoryStatus from "../pages/backend/Category/CategoryStatus";
import DeleteCategory from "../pages/backend/Category/DeleteCategory";
import CategoryForm from "../pages/backend/Category/CategoryForm";
import CategoryDetail from "../pages/backend/Category/CategoryDetail";
import CategoryList from "../pages/backend/Category/CategoryList";
import OrderList from "../pages/backend/Order/OrderList";
import OrderDetail from "../pages/backend/Order/OrderDetail";
import CartList from "../pages/backend/Cart/CartList";
import CartDetail from "../pages/backend/Cart/CartDetail";
import FavoriteList from "../pages/backend/Favorite/FavoriteList";
import ReviewList from "../pages/backend/Review/ReviewList";
import WalletList from "../pages/backend/Wallet/WalletList";
import ListBanner from "../pages/backend/Banner/ListBanner";
import CreateBanner from "../pages/backend/Banner/CreateBanner";
import PostList from "../pages/backend/Post/PostList";
import PostDetail from "../pages/backend/Post/PostDetail";
import PostForm from "../pages/backend/Post/PostForm";

const RouterAdmin = [
  // Protected admin routes with layout
  {
    path: "",
    element: (
      <AdminGuard>
        <LayoutAdmin />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "home",
        element: <Dashboard />,
      },
      // Thêm các route admin khác ở đây
      //Người dùng
      {
        path: "users",
        element: <UserList />,
      },
      {
        path: "users/:id",
        element: <UserDetail />,
      },
      //product
      {
        path: "products",
        element: <ProductList />,
      },
      {
        path: "products/new",
        element: <ProductForm />,
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
      },
      {
        path: "products/:id/edit",
        element: <ProductForm />,
      },
      {
        path: "products/:id/delete",
        element: <DeleteProduct />,
      },
      {
        path: "products/:id/:action",
        element: <ProductStatusChange />,
      },
      //categories
      {
        path: "categories",
        element: <CategoryList />,
      },
      {
        path: "categories/new",
        element: <CategoryForm />,
      },
      {
        path: "categories/:id",
        element: <CategoryDetail />,
      },
      {
        path: "categories/:id/edit",
        element: <CategoryForm />,
      },
      {
        path: "categories/:id/delete",
        element: <DeleteCategory />,
      },
      {
        path: "categories/:id/:action",
        element: <CategoryStatus />,
      },
      //orders
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/:orderId",
        element: <OrderDetail />,
      },
      //carts
      {
        path: "carts",
        element: <CartList />,
      },
      {
        path: "carts/:cartId",
        element: <CartDetail />,
      },
      //favourites
      {
        path: "favourites",
        element: <FavoriteList />,
      },

      //reviews
      {
        path: "reviews",
        element: <ReviewList />,
      },
      //wallets
      {
        path: "wallets",
        element: <WalletList />,
      },
      {
        path: "banners",
        element: <ListBanner />,
      },
      {
        path: "banners/new",
        element: <CreateBanner />,
      },
      {
        path: "posts",
        element: <PostList />,
      },
      {
        path: "posts/:id",
        element: <PostDetail />,
      },
      {
        path: "posts/create",
        element: <PostForm />,
      },
      {
        path: "posts/edit/:id",
        element: <PostForm />,
      },
    ],
  },

  // Standalone routes without any layout
  {
    path: "login",
    element: <Login isAdminRoute={true} />,
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "unauthorized",
    element: <Unauthorized />,
  },
];

export default RouterAdmin;
