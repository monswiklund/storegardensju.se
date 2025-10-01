import { Suspense, lazy } from 'react';
import FadeInSection from "../components/FadeInSection.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PageSection from "../components/PageSection.jsx";

// Lazy load heavy components
const Vilka = lazy(() => import('../components/Vilka.jsx'));

function TeamPage() {
    return (
        <main role="main" id="main-content">

            {/* Team */}
            <PageSection background="var(--background-alt)" ariaLabel="about-heading">
                <ErrorBoundary>
                    <FadeInSection>
                        <Suspense fallback={<LoadingSpinner size="medium" text="Laddar teamet..." />}>
                            <Vilka/>
                        </Suspense>
                    </FadeInSection>
                </ErrorBoundary>
            </PageSection>
        </main>
    );
}

export default TeamPage;
