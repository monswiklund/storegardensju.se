import { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../CartContext/CartContext.jsx';
import './CartBadge.css';

export default function CartBadge() {
    const { getItemCount, openCart } = useContext(CartContext);
    const count = getItemCount();

    return (
        <button 
            type="button"
            onClick={openCart}
            className="cart-badge" 
            aria-label={`Visa varukorg med ${count} produkter`}
        >
            <ShoppingCart size={24} />
            {count > 0 && <span className="cart-count">{count}</span>}
        </button>
    );
}
