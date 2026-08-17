import { useContext } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { formatPrice } from "../services/stripeService";
import { useSiteCopy } from "../hooks/usePageCopy";
import "./CartPage.css";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, getTotal, clearCart, getItemCount } =
    useContext(CartContext);
  const siteCopy = useSiteCopy();

  if (cart.length === 0) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="cart-empty">
            <ShoppingBag size={64} strokeWidth={1.5} />
            <h1>{siteCopy("cart.empty-message")}</h1>
            <p>{siteCopy("cart.empty-subtext")}</p>
            <Link to="/butik/" className="btn-primary">
              {siteCopy("cart.continue-shopping")}
            </Link>
          </div>
        </PageSection>
      </main>
    );
  }

  return (
    <main role="main" id="main-content">
      <PageSection background="alt" spacing="default">
        <div className="cart-container">
          <div className="cart-header">
            <h1>{siteCopy("cart.drawer-title")}</h1>
            <button
              onClick={clearCart}
              className="btn-text"
              aria-label={siteCopy("cart.remove-item")}
            >
              {siteCopy("cart.remove-item")}
            </button>
          </div>

          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="cart-item-image"
                />

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{formatPrice(item.price)}</p>
                  {item.artist && (
                    <p className="cart-item-artist">{item.artist}</p>
                  )}
                </div>

                <div className="cart-item-quantity">
                  {(item.stock || 1) > 1 ? (
                    <>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        aria-label={siteCopy("cart.decrease-qty")}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.stock || 1, item.quantity + 1)
                          )
                        }
                        aria-label={siteCopy("cart.increase-qty")}
                        disabled={item.quantity >= (item.stock || 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="unique-item">{siteCopy("cart.unique-item")}</span>
                  )}
                </div>

                <div className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="cart-item-remove"
                  aria-label={siteCopy("cart.remove-item")}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>{siteCopy("cart.quantity-label")}</span>
            <span>{getItemCount()}</span>
          </div>
          <div className="cart-summary-row cart-total">
            <span>{siteCopy("cart.total")}</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          
          <Link to="/checkout" className="btn btn-primary checkout-btn">
            {siteCopy("cart.checkout")}
          </Link>
          
          <Link to="/butik/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            {siteCopy("cart.continue-shopping")}
          </Link>
        </div>
        </div>
      </PageSection>
    </main>
  );
}
