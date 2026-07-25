import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildInfo.css';

function BuildInfo() {
    const [buildInfo, setBuildInfo] = useState(null);
    const navigate = useNavigate();
    const clickCountRef = useRef(0);
    const resetTimerRef = useRef(null);

    useEffect(() => {
        // Try to load build info
        import('../../build.json')
            .then(module => setBuildInfo(module.default))
            .catch(() => {
                // Fallback if build.json doesn't exist
                setBuildInfo({
                    version: '1.0.0-dev',
                    buildTime: new Date().toISOString(),
                    buildNumber: 'dev'
                });
            });
    }, []);

    const handleBuildClick = (e) => {
        e.preventDefault();
        clickCountRef.current += 1;

        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }

        if (clickCountRef.current >= 3) {
            clickCountRef.current = 0;
            navigate('/admin');
        } else {
            resetTimerRef.current = setTimeout(() => {
                clickCountRef.current = 0;
            }, 1000);
        }
    };

    if (!buildInfo) return null;

    return (
        <div className="build-info">
            <span
                className="build-version"
                onClick={handleBuildClick}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Klicka 3 gånger för Admin"
            >
                v{buildInfo.version}
            </span>
            <span className="build-credit">
                Skapad av Måns Wiklund
            </span>
        </div>
    );
}

export default BuildInfo;