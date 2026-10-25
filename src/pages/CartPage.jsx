import { useContext } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { formatPrice } from "../services/stripeService";
import { useSiteCopy } from "../hooks/usePageCopy";
import "./CartPage.css";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, getTotal, getItemCount } =
    useContext(CartContext);
  const siteCopy = useSiteCopy();

  if (cart.length === 0) {
    return (
      <main role="main" id="main-content">
        <PageSection background="alt" spacing="default">
          <div className="cart-empty">
            <ShoppingBag size={56} strokeWidth={1.5} aria-hidden="true" />
            <h1>{siteCopy("cart.empty-message")}</h1>
            <p>{siteCopy("cart.empty-subtext")}</p>
            <Link to="/butik/" className="btn btn--primary">
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
          {/* Items are removed one at a time with the bin on each row; there is no
              empty-the-cart button, so one click can never drop every piece. */}
          <div className="cart-header">
            <h1>{siteCopy("cart.drawer-title")}</h1>
          </div>

          <ul className="cart-items">
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt="" className="cart-item-image" />
                ) : (
                  <span className="cart-item-image" aria-hidden="true" />
                )}

                <div className="cart-item-details">
                  <h2>{item.name}</h2>
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
                        type="button"
                        aria-label={`${siteCopy("cart.decrease-qty")}: ${item.name}`}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.stock || 1, item.quantity + 1)
                          )
                        }
                        type="button"
                        aria-label={`${siteCopy("cart.increase-qty")}: ${item.name}`}
                        disabled={item.quantity >= (item.stock || 1)}
                      >
                        <Plus size={16} aria-hidden="true" />
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
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="cart-item-remove"
                  aria-label={`${siteCopy("cart.remove-item")}: ${item.name}`}
                >
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>{siteCopy("cart.quantity-label")}</span>
            <span>{getItemCount()}</span>
          </div>
          <div className="cart-summary-row cart-total">
            <span>{siteCopy("cart.total")}</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <p className="cart-shipping-note">{siteCopy("cart.shipping-note")}</p>
          
          <Link to="/checkout/" className="btn btn--primary checkout-btn">
            {siteCopy("cart.checkout")}
          </Link>
          
          <Link to="/butik/" className="btn btn--secondary cart-continue-btn">
            {siteCopy("cart.continue-shopping")}
          </Link>
        </div>
        </div>
      </PageSection>
    </main>
  );
}
