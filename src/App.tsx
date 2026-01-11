import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { WorldScene } from './scenes/WorldScene';
import { MobileControls } from './components/ui/MobileControls';
import { UIOverlay } from './components/ui/UIOverlay';
import { Loader } from '@react-three/drei';

export default function App() {
    // Resize handler to ensure 100% height on weird mobile browsers
    useEffect(() => {
        const setHeight = () => {
            document.body.style.height = window.innerHeight + 'px';
        };
        // Bind to resize event
        window.addEventListener('resize', setHeight);
        setHeight(); // Initial set

        return () => window.removeEventListener('resize', setHeight);
    }, []);

    return (
        <>
            {/* The Canvas fills the #root div which is absolute 100% */}
            <Canvas
                shadows
                camera={{ fov: 75, position: [0, 5, 10] }}
                // Optimization: Limit pixel ratio for performance on high-DPI mobile
                gl={{ antialias: false, powerPreference: 'high-performance', pixelRatio: Math.min(2, window.devicePixelRatio) }}
                className="touch-none"
            >
                <color attach="background" args={['#000']} />
                <Suspense fallback={null}>
                    {/* Direct World Entry - No States for now to simplify */}
                    <WorldScene onExit={() => { }} />
                </Suspense>
            </Canvas>

            {/* UI overlay is separate from Canvas */}
            {/* pointer-events-none lets clicks pass through to Canvas */}
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                <MobileControls />
                <UIOverlay gameState="WORLD" />
            </div>

            <Loader />
        </>
    );
}

// export default App; // Removed duplicate
