import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import FlyToCartAnimation from "./components/FlyToCartAnimation";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <CartProvider>
        <App />
        <FlyToCartAnimation />
      </CartProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
