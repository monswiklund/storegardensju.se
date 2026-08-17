import { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../CartContext/CartContext.jsx';
import { useSiteCopy } from '../../../hooks/usePageCopy';
import './CartBadge.css';

export default function CartBadge() {
    const { getItemCount, openCart } = useContext(CartContext);
    const count = getItemCount();
    const siteCopy = useSiteCopy();

    if (!count || count <= 0) {
        return null;
    }

    return (
        <button 
            type="button"
            onClick={openCart}
            className="cart-badge" 
            aria-label={`${siteCopy("ui.cart-badge-label")} (${count})`}
        >
            <ShoppingCart size={24} />
            <span className="cart-count">{count}</span>
        </button>
    );
}
