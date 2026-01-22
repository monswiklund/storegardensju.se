import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../CartContext/CartContext.jsx';
import './CartBadge.css';

export default function CartBadge() {
    const { getItemCount } = useContext(CartContext);
    const count = getItemCount();

    return (
        <Link to="/varukorg" className="cart-badge" aria-label={`Varukorg med ${count} produkter`}>
            <ShoppingCart size={24} />
            {count > 0 && <span className="cart-count">{count}</span>}
        </Link>
    );
}
