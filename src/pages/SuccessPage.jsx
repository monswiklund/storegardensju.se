import { useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { CartContext } from '../components/layout/CartContext/CartContext.jsx';
import { PageSection } from '../components';
import './SuccessPage.css';

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useContext(CartContext);

    useEffect(() => {
        // Töm varukorgen efter lyckad beställning
        if (sessionId) {
            clearCart();
        }
    }, [sessionId, clearCart]);

    return (
        <main role="main" id="main-content">
            <PageSection background="white" spacing="default">
                <div className="success-container">
                    <CheckCircle size={80} className="success-icon" />
                    <h1>Tack för din beställning!</h1>
                    <p className="success-message">
                        Din betalning har genomförts och din order är bekräftad.
                    </p>

                    {sessionId && (
                        <div className="order-details">
                            <p className="session-id">
                                <strong>Order-ID:</strong> {sessionId}
                            </p>
                            <p className="info-text">
                                Du kommer få en orderbekräftelse via e-post inom kort.
                            </p>
                        </div>
                    )}

                    <p className="contact-info">
                        Har du frågor om din beställning? Kontakta oss på{' '}
                        <a href="mailto:storegardensju@gmail.com">storegardensju@gmail.com</a>
                    </p>

                    <div className="success-actions">
                        <Link to="/butik" className="btn-primary">
                            Fortsätt handla
                        </Link>
                        <Link to="/" className="btn-secondary">
                            Tillbaka till startsidan
                        </Link>
                    </div>
                </div>
            </PageSection>
        </main>
    );
}
