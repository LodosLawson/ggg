import { Physics } from '@react-three/cannon';
import { Cloud } from '@react-three/drei';
import { Player } from '../components/player/Player';
import { ChunkManager } from '../components/world/ChunkManager';
import { DynamicSky } from '../components/world/DynamicSky';

interface WorldSceneProps {
    onExit: () => void;
}

export function WorldScene({ onExit }: WorldSceneProps) {

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[50, 50, 25]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            <DynamicSky />
            <Cloud opacity={0.5} speed={0.4} segments={20} position={[0, 20, 0]} />

            <Physics gravity={[0, -9.81, 0]}>
                <ChunkManager />
                <Player position={[0, 10, 0]} /> {/* Spawn closer to ground */}
            </Physics>

            {/* Helper to exit */}
            <mesh position={[0, 50, 0]} onClick={onExit}>
                <sphereGeometry args={[2]} />
                <meshBasicMaterial color="red" />
            </mesh>
        </>
    );
}
