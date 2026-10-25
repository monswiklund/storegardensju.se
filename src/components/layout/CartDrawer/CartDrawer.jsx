import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { CartContext } from "../CartContext/CartContext";
import { formatPrice } from "../../../services/stripeService";
import { useSiteCopy } from "../../../hooks/usePageCopy";
import "./CartDrawer.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const siteCopy = useSiteCopy();
  const drawerRef = useRef(null);

  // While open the drawer is a modal dialog: focus moves in, Tab stays inside, Escape closes,
  // and focus goes back to whatever opened it (the cart badge or a "Köp" button).
  useEffect(() => {
    if (!isCartOpen) return undefined;
    const drawer = drawerRef.current;
    const opener = document.activeElement;
    drawer?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !drawer) return;
      const focusable = [...drawer.querySelectorAll(FOCUSABLE)];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === drawer)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Only hand focus back if it is still in the (now inert) drawer or was dropped to <body>;
      // a link that navigated away keeps its own focus handling.
      const active = document.activeElement;
      const focusWasInDrawer = !active || active === document.body || drawer?.contains(active);
      if (focusWasInDrawer && opener?.isConnected && !opener.disabled) {
        opener.focus();
      }
    };
  }, [isCartOpen, closeCart]);

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
    navigate("/varukorg/");
  };

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isCartOpen ? "is-open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Closed, the drawer is inert and visibility: hidden, so it is out of the tab order,
          the accessibility tree and the heading outline, and its shadow cannot show. */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isCartOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        inert={!isCartOpen}
      >
        <div className="cart-drawer-header">
          <h2 id="cart-drawer-title">{siteCopy("cart.drawer-title")}</h2>
          <button type="button" className="close-drawer-btn" onClick={closeCart} aria-label={siteCopy("ui.close")}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="cart-drawer-content">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} strokeWidth={1} aria-hidden="true" />
              <p>{siteCopy("cart.empty-message")}</p>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ marginTop: '1rem' }}
                onClick={closeCart}
              >
                {siteCopy("cart.continue-shopping")}
              </button>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cart.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.images?.[0] && (
                      <img src={item.images[0]} alt="" loading="lazy" decoding="async" />
                    )}
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <div className="cart-item-price">{formatPrice(item.price)}</div>

                    {item.stock > 1 && (
                      <div className="cart-item-qty">
                        <button
                          type="button"
                          className="qty-small-btn"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          aria-label={`${siteCopy("cart.decrease-qty")}: ${item.name}`}
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-small-btn"
                          onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                          disabled={item.quantity >= item.stock}
                          aria-label={`${siteCopy("cart.increase-qty")}: ${item.name}`}
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(item.id)}
                    aria-label={`${siteCopy("cart.remove-item")}: ${item.name}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span>{siteCopy("cart.total")}</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <p className="cart-shipping-note">{siteCopy("cart.shipping-note")}</p>
            <button type="button" className="btn btn--primary checkout-btn" onClick={handleCheckout}>
              {siteCopy("cart.checkout")} <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
