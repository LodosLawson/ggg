import { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { VoxelChunk } from './VoxelChunk';
// import * as THREE from 'three'; // Unused

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 4; // chunks radius (e.g. 3 = 7x7 grid)

export function ChunkManager() {
    const { camera } = useThree();
    const [chunks, setChunks] = useState<{ x: number, z: number, key: string }[]>([]);

    // We update chunk list periodically
    const [lastChunk, setLastChunk] = useState({ x: 99999, z: 99999 });

    useFrame(() => {
        const cx = Math.floor(camera.position.x / CHUNK_SIZE);
        const cz = Math.floor(camera.position.z / CHUNK_SIZE);

        if (cx !== lastChunk.x || cz !== lastChunk.z) {
            setLastChunk({ x: cx, z: cz });

            const newChunks = [];
            for (let x = cx - RENDER_DISTANCE; x <= cx + RENDER_DISTANCE; x++) {
                for (let z = cz - RENDER_DISTANCE; z <= cz + RENDER_DISTANCE; z++) {
                    newChunks.push({ x: x * CHUNK_SIZE, z: z * CHUNK_SIZE, key: `${x},${z}` });
                }
            }
            setChunks(newChunks);
        }
    });

    return (
        <group>
            {chunks.map(chunk => (
                <VoxelChunk
                    key={chunk.key}
                    position={[chunk.x, chunk.z]}
                    chunkSize={CHUNK_SIZE}
                />
            ))}
        </group>
    );
}
