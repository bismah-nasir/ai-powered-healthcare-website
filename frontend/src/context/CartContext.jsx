import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load initial cart state from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id);

      if (existingItem) {
        // Enforce stock limits
        const nextQty = existingItem.quantity + 1;
        if (nextQty > item.stock) {
          alert(`Cannot add more. Only ${item.stock} items left in stock.`);
          return prevItems;
        }
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

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === itemId) {
          if (nextQty > item.stock) {
            alert(`Cannot increase quantity. Only ${item.stock} items in stock.`);
            return item;
          }
          return { ...item, quantity: nextQty };
        }
        return item;
      })
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
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
