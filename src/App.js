import { useRoutes, useLocation } from "react-router-dom";
import LayoutSite from "./layouts/LayoutSite";
import NoPage from "./pages/NoPage";
import RouterApp from "./routers";
import Login from "./components/Login";
import Register from "./components/Register";
import Unauthorized from "./components/Unauthorized";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";
import { useEffect } from "react";
import { initSocialSDKs } from "./utils/social-auth-setup";
import AuthUI from "./components/authUser/auth-ui";
import UserRegister from "./components/authUser/user-register";

function App() {
  const location = useLocation();

  useEffect(() => {
    console.log("Initializing social SDKs...");
    initSocialSDKs()
      .then((success) => {
        console.log("Social SDKs initialization result:", success);
      })
      .catch((error) => {
        console.error("Failed to initialize social SDKs:", error);
      });
  }, []);

  const routes = useRoutes([
    {
      index: true,
      element: <AuthUI />,
    },
    {
      path: "/dang-ky",
      element: <UserRegister />,
    },
    {
      path: "/",
      element: <LayoutSite />,
      children: RouterApp.RouterSite,
    },
    {
      path: "/admin/login",
      element: <Login isAdminRoute={true} />,
    },
    {
      path: "/admin/register",
      element: <Register />,
    },
    {
      path: "/admin/unauthorized",
      element: <Unauthorized />,
    },
    {
      path: "/admin/*",
      children: RouterApp.RouterAdmin,
    },
    {
      path: "*",
      element: <NoPage />,
    },
  ]);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Conditionally render ScrollToTop and PageTransition based on the route */}
      {!isAdminRoute && <ScrollToTop />}
      {!isAdminRoute && <PageTransition />}
      {routes}
    </>
  );
}

export default App;
