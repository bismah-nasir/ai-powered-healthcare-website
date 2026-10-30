import { createContext, useContext, useState, useEffect } from 'react';
import { useNotify } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cart';

// A saved cart line must have every field the cart reads, with the right type
const isValidCartItem = (item) =>
  item !== null
  && typeof item === 'object'
  && typeof item._id === 'string'
  && item._id !== ''
  && typeof item.name === 'string'
  && typeof item.category === 'string'
  && Number.isFinite(item.price)
  && item.price >= 0
  && Number.isFinite(item.stock)
  && item.stock >= 0
  && Number.isInteger(item.quantity)
  && item.quantity >= 1;

// Read the saved cart, dropping anything malformed (edited by hand, truncated, etc.)
const loadSavedCart = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];

    const seenIds = new Set();
    return parsed.filter((item) => {
      if (!isValidCartItem(item) || seenIds.has(item._id)) return false;
      seenIds.add(item._id);
      return true;
    });
  } catch {
    // Unreadable JSON or storage blocked by the browser
    return [];
  }
};

// eslint-disable-next-line react-refresh/only-export-components -- hook is kept next to its provider
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadSavedCart);

  const { showNotice } = useNotify();
  const { user } = useAuth();

  // Empty the cart when a signed-in user logs out or another account signs in,
  // so the next person on this browser doesn't see it. A guest's cart is kept on login.
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (prevUser && prevUser._id !== user?._id) {
      setCartItems([]);
    }
  }

  // Save cart to localStorage whenever it changes (this also overwrites a corrupted saved cart)
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      // Storage full or blocked: the cart still works for this visit
      console.error('[Cart Context] Could not save cart:', error.message);
    }
  }, [cartItems]);

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cartItems.find((i) => i._id === item._id);

    // Enforce stock limits
    if (existingItem && existingItem.quantity + 1 > item.stock) {
      showNotice({ message: `Cannot add more. Only ${item.stock} items left in stock.` });
      return;
    }

    setCartItems((prevItems) => {
      const prevItem = prevItems.find((i) => i._id === item._id);

      if (prevItem) {
        const nextQty = prevItem.quantity + 1;
        if (nextQty > item.stock) return prevItems;
        return prevItems.map((i) =>
          i._id === item._id ? { ...i, quantity: nextQty } : i
        );
      }

      // Fresh item add
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId, nextQty) => {
    if (nextQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    const cartItem = cartItems.find((item) => item._id === itemId);
    if (cartItem && nextQty > cartItem.stock) {
      showNotice({ message: `Cannot increase quantity. Only ${cartItem.stock} items in stock.` });
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId && nextQty <= item.stock ? { ...item, quantity: nextQty } : item
      )
    );
  };

  // Overwrite an item's stored stock (the saved cart can be out of date with the catalog)
  const syncItemStock = (itemId, stock) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item._id === itemId ? { ...item, stock } : item))
    );
  };

  // Empty cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Derived states
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        syncItemStock,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
