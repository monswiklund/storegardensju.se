// File: src/context/CartContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const raw = localStorage.getItem('cart');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch {}
    }, [cart]);

    const addItem = (product, qty = 1) => {
        setCart(prev => {
            const idx = prev.findIndex(p => p.id === product.id);
            if (idx > -1) {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
                return copy;
            }
            return [...prev, { ...product, quantity: qty }];
        });
    };

    const removeItem = id => setCart(prev => prev.filter(p => p.id !== id));
    const updateQuantity = (id, quantity) =>
        setCart(prev => prev.map(p => (p.id === id ? { ...p, quantity } : p)));
    const clearCart = () => setCart([]);

    // Beräkna totalsumma
    const getTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Antal items totalt
    const getItemCount = () => cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getTotal,
            getItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
}
