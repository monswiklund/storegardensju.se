import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { CartContext } from "../CartContext/CartContext";
import { formatPrice } from "../../../services/stripeService";
import "./CartDrawer.css";

function CartDrawer() {
  const { 
    cart, 
    removeItem, 
    updateQuantity, 
    getTotal, 
    isCartOpen, 
    closeCart 
  } = useContext(CartContext);
  
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeCart]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate("/varukorg");
  };

  return (
    <>
      <div 
        className={`cart-drawer-overlay ${isCartOpen ? "is-open" : ""}`} 
        onClick={closeCart}
      />
      
      <aside className={`cart-drawer ${isCartOpen ? "is-open" : ""}`}>
        <div className="cart-drawer-header">
          <h2>Varukorg</h2>
          <button className="close-drawer-btn" onClick={closeCart} aria-label="Stäng">
            <X size={24} />
          </button>
        </div>

        <div className="cart-drawer-content">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Din varukorg är tom</p>
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '1rem' }}
                onClick={closeCart}
              >
                Fortsätt handla
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.images[0]} alt={item.name} />
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <div className="cart-item-price">{formatPrice(item.price)}</div>
                    
                    {item.stock > 1 && (
                      <div className="cart-item-qty">
                        <button 
                          className="qty-small-btn"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          className="qty-small-btn"
                          onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <button 
                    className="remove-item-btn" 
                    onClick={() => removeItem(item.id)}
                    aria-label="Ta bort"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span>Totalt</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              Gå till kassan <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
