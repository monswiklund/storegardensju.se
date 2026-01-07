import React, { useState, useContext } from 'react';
import { CartContext } from '../../components/layout/CartContext/CartContext.jsx';

const CheckoutButton = () => {
    const { cart } = useContext(CartContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        if (!cart || cart.length === 0) {
            setError('Varukorgen är tom.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4242';

            const response = await fetch(`${API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();
            if (data?.sessionId && data?.verifyToken) {
                sessionStorage.setItem(
                    `checkout_verify_token:${data.sessionId}`,
                    data.verifyToken
                );
            }
            const url = data?.url;
            if (!url) {
                throw new Error('No checkout URL received from backend');
            }
            window.location.href = url;
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Något gick fel. Försök igen.');
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#5469d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                }}
            >
                {loading ? 'Laddar...' : 'Gå till kassan'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CheckoutButton;
