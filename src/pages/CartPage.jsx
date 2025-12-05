import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartContext } from "../components/layout/CartContext/CartContext.jsx";
import { PageSection } from "../components";
import { formatPrice } from "../data/products";
import "./CartPage.css";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, getTotal, clearCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <main role="main" id="main-content">
        <PageSection background="white" spacing="default">
          <div className="cart-empty">
            <ShoppingBag size={64} strokeWidth={1.5} />
            <h1>Din varukorg är tom</h1>
            <p>Lägg till produkter från vår butik</p>
            <Link to="/butik" className="btn-primary">
              Till butiken
            </Link>
          </div>
        </PageSection>
      </main>
    );
  }

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <main role="main" id="main-content">
      <PageSection background="white" spacing="default">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Varukorg</h1>
            <button
              onClick={clearCart}
              className="btn-text"
              aria-label="Töm varukorg"
            >
              Töm varukorg
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
                    <p className="cart-item-artist">Av {item.artist}</p>
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
                        aria-label="Minska antal"
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
                        aria-label="Öka antal"
                        disabled={item.quantity >= (item.stock || 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </>
                  ) : (
                    <span className="unique-item">Unikt exemplar</span>
                  )}
                </div>

                <div className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="cart-item-remove"
                  aria-label={`Ta bort ${item.name}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Delsumma:</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <div className="cart-summary-row">
              <span>Frakt:</span>
              <span>Beräknas vid kassan</span>
            </div>
            <div className="cart-summary-row cart-total">
              <span>Totalt:</span>
              <span>{formatPrice(getTotal())}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary btn-large">
              Gå till kassan
            </button>

            <Link to="/butik" className="btn-secondary">
              Fortsätt handla
            </Link>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
