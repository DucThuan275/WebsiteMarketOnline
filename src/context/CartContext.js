import { createContext, useState, useContext, useEffect } from "react";
import CartService from "../api/CartService";

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Provider component
export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch cart data
  const fetchCart = async () => {
    try {
      const cart = await CartService.getCurrentUserCart();
      setCartItems(cart.items || []);
      setCartItemCount(cart.items?.length || 0);
    } catch (err) {
      console.error("Error fetching cart data:", err);
      setCartItems([]);
      setCartItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      await CartService.addItemToCart({
        productId,
        quantity,
      });

      // Fetch updated cart data
      await fetchCart();
      return true;
    } catch (err) {
      console.error("Error adding item to cart:", err);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      await CartService.removeItemFromCart(itemId);
      await fetchCart();
      return true;
    } catch (err) {
      console.error("Error removing item from cart:", err);
      return false;
    }
  };

  // Update item quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    try {
      await CartService.updateCartItemQuantity(itemId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      console.error("Error updating cart item quantity:", err);
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await CartService.clearCart();
      setCartItems([]);
      setCartItemCount(0);
      return true;
    } catch (err) {
      console.error("Error clearing cart:", err);
      return false;
    }
  };

  // Fetch cart on component mount
  useEffect(() => {
    // Only fetch if user is logged in
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  // Value to be provided by the context
  const value = {
    cartItemCount,
    cartItems,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
