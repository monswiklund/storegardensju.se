// File: src/context/CartContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addItem = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback(
    (id) => setCart((prev) => prev.filter((p) => p.id !== id)),
    []
  );

  const updateQuantity = useCallback(
    (id, quantity) =>
      setCart((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantity } : p))
      ),
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    // Rensa även localStorage direkt för säkerhets skull
    try {
      localStorage.removeItem("cart");
    } catch {}
  }, []);

  // Beräkna totalsumma (memoized)
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const getTotal = useCallback(() => total, [total]);

  // Antal items totalt (memoized)
  const itemCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );
  const getItemCount = useCallback(() => itemCount, [itemCount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
