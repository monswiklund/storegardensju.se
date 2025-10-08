import { useState, useEffect } from 'react';
import './BuildInfo.css';

function BuildInfo() {
    const [buildInfo, setBuildInfo] = useState(null);

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

    if (!buildInfo) return null;

    return (
        <div className="build-info">
            <span className="build-version">v{buildInfo.version}</span>
            {process.env.NODE_ENV === 'development' && (
                <span className="build-details">
                    Build #{buildInfo.buildNumber} | {new Date(buildInfo.buildTime).toLocaleDateString('sv-SE')}
                </span>
            )}
        </div>
    );
}

export default BuildInfo