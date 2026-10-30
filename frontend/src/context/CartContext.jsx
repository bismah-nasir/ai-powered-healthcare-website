import { createContext, useContext, useState, useEffect } from 'react';
import { useNotify } from './NotificationContext';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook is kept next to its provider
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load initial cart state from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const { showNotice } = useNotify();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
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
