import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { GalaxyScene } from './scenes/GalaxyScene';
import { WorldScene } from './scenes/WorldScene';
import { UIOverlay } from './components/ui/UIOverlay';
import { Leva } from 'leva';
import { Loader } from '@react-three/drei';

import { MobileControls } from './components/ui/MobileControls';

// type GameState = 'GALAXY' | 'WORLD'; // Unused

export default function App() {
    const [gameState, setGameState] = useState<'GALAXY' | 'WORLD'>('WORLD'); // setGameState unused for now
    // const [targetPlanet, setTargetPlanet] = useState<any>(null); // Commented out properly

    const startWorld = (planetData: any) => {
        // setTargetPlanet(planetData);
        console.log("Starting world with", planetData); // Use it to silence warning if needed, or just comment
        setGameState('WORLD');
    };

    return (
        <>
            <div className="w-screen h-[100dvh] relative overflow-hidden">
                <MobileControls />
                <Leva collapsed hidden={window.location.hash !== '#debug'} />

                {/* Crosshair */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 1000
                }} />

                <Canvas
                    shadows
                    camera={{ fov: 75, position: [0, 5, 10] }}
                    onPointerDown={(e) => {
                        // Lock pointer on click if not interacting with UI
                        if (e.target instanceof HTMLCanvasElement) {
                            (e.target as HTMLCanvasElement).requestPointerLock();
                        }
                    }}
                    gl={{ antialias: false, pixelRatio: 1 }} // Low-res pixel feel
                >
                    <color attach="background" args={['#050505']} />
                    <Suspense fallback={null}>
                        {gameState === 'GALAXY' ? (
                            <GalaxyScene onSelectPlanet={startWorld} />
                        ) : (
                            <WorldScene onExit={() => setGameState('GALAXY')} />
                        )}
                    </Suspense>
                </Canvas>

                <UIOverlay gameState={gameState} />
                <Loader />
            </div>
        </>
    );
}

// export default App; // Removed duplicate
